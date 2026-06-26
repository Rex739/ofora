#![no_std]

mod events;
mod storage;
mod types;

use soroban_sdk::{
    auth::{ContractContext, InvokerContractAuthEntry, SubContractInvocation},
    contract, contractimpl,
    crypto::bls12_381::Bls12381Fr,
    symbol_short, vec, Address, Bytes, BytesN, Env, IntoVal, String, Symbol, Vec,
};

use crate::storage::{
    has_tender, read_fair_award_receipt, read_tender, write_fair_award_receipt, write_tender,
};
use crate::types::{
    FairAwardReceipt, PaymentStatus, TenderRecord, TenderStatus, VerificationReceipt,
};

#[contract]
pub struct OforaRegistry;

#[contractimpl]
impl OforaRegistry {
    pub fn initialize_tender(
        env: Env,
        admin: Address,
        tender_id: String,
        policy_commitment: Bytes,
        policy_version: String,
        submission_deadline: u64,
        verifier_contract: Address,
    ) {
        admin.require_auth();
        if has_tender(&env, &tender_id) {
            panic!("tender already initialized");
        }

        let record = TenderRecord {
            admin,
            tender_id: tender_id.clone(),
            policy_commitment,
            policy_version,
            status: TenderStatus::Draft,
            submission_deadline,
            max_bid_commitments: 3,
            bid_commitments: Vec::new(&env),
            validated_winner_commitment: None,
            award_receipt_id: None,
            validation_timestamp: None,
            payment_status: PaymentStatus::NotReady,
            verifier_contract,
        };
        write_tender(&env, &record);
        events::tender_initialized(&env, tender_id);
    }

    pub fn initialize_finalization_tender(
        env: Env,
        admin: Address,
        tender_id: String,
        policy_commitment: Bytes,
        policy_version: String,
        submission_deadline: u64,
        verifier_contract: Address,
        atlas_bid_commitment: Bytes,
        nova_bid_commitment: Bytes,
        meridian_bid_commitment: Bytes,
    ) {
        admin.require_auth();
        if has_tender(&env, &tender_id) {
            panic!("tender already initialized");
        }

        let record = TenderRecord {
            admin,
            tender_id: tender_id.clone(),
            policy_commitment,
            policy_version,
            status: TenderStatus::EvaluationInProgress,
            submission_deadline,
            max_bid_commitments: 3,
            bid_commitments: vec![
                &env,
                atlas_bid_commitment,
                nova_bid_commitment,
                meridian_bid_commitment,
            ],
            validated_winner_commitment: None,
            award_receipt_id: None,
            validation_timestamp: None,
            payment_status: PaymentStatus::NotReady,
            verifier_contract,
        };
        write_tender(&env, &record);
        events::tender_initialized(&env, tender_id);
    }

    pub fn lock_policy(env: Env, admin: Address, tender_id: String) {
        admin.require_auth();
        let mut record = read_tender(&env, &tender_id);
        require_admin(&record, &admin);
        require_status(&record, TenderStatus::Draft);
        record.status = TenderStatus::Locked;
        write_tender(&env, &record);
    }

    pub fn register_bid_commitment(
        env: Env,
        admin: Address,
        tender_id: String,
        bid_commitment: Bytes,
    ) {
        admin.require_auth();
        let mut record = read_tender(&env, &tender_id);
        require_admin(&record, &admin);
        if record.status != TenderStatus::Locked
            && record.status != TenderStatus::OpenForSubmissions
        {
            panic!("policy must be locked before bids register");
        }
        if record.bid_commitments.len() >= record.max_bid_commitments {
            panic!("maximum bid commitments reached");
        }
        record.status = TenderStatus::OpenForSubmissions;
        record.bid_commitments.push_back(bid_commitment.clone());
        write_tender(&env, &record);
        events::bid_registered(&env, tender_id, bid_commitment);
    }

    pub fn close_submissions(env: Env, admin: Address, tender_id: String) {
        admin.require_auth();
        let mut record = read_tender(&env, &tender_id);
        require_admin(&record, &admin);
        require_status(&record, TenderStatus::OpenForSubmissions);
        record.status = TenderStatus::EvaluationInProgress;
        write_tender(&env, &record);
    }

    pub fn begin_evaluation(env: Env, admin: Address, tender_id: String) {
        admin.require_auth();
        let mut record = read_tender(&env, &tender_id);
        require_admin(&record, &admin);
        require_status(&record, TenderStatus::OpenForSubmissions);
        if record.bid_commitments.len() != record.max_bid_commitments {
            panic!("exactly three bid commitments required");
        }
        record.status = TenderStatus::EvaluationInProgress;
        write_tender(&env, &record);
    }

    pub fn validate_award(
        env: Env,
        admin: Address,
        tender_id: String,
        selected_bid_commitment: Bytes,
        receipt_id: String,
        receipt_nonce: Bytes,
        proof: Bytes,
        public_inputs: Bytes,
    ) {
        admin.require_auth();
        let mut record = read_tender(&env, &tender_id);
        require_admin(&record, &admin);
        require_status(&record, TenderStatus::EvaluationInProgress);
        if record.validated_winner_commitment.is_some() {
            panic!("award already validated");
        }
        if !record.bid_commitments.contains(&selected_bid_commitment) {
            panic!("selected commitment was not registered");
        }
        require_public_inputs_match_record(
            &env,
            &record,
            &selected_bid_commitment,
            &receipt_nonce,
            &public_inputs,
        );

        // The verifier contract must be the generated Noir UltraHonk Soroban
        // verifier deployed with the matching Ofora verification key.
        let verified: bool = env.invoke_contract(
            &record.verifier_contract,
            &symbol_short!("verify"),
            (public_inputs, proof).into_val(&env),
        );
        if !verified {
            panic!("proof rejected by verifier");
        }

        record.status = TenderStatus::Validated;
        record.validated_winner_commitment = Some(selected_bid_commitment.clone());
        record.award_receipt_id = Some(receipt_id.clone());
        record.validation_timestamp = Some(env.ledger().timestamp());
        record.payment_status = PaymentStatus::ReadyForControlledRelease;
        write_tender(&env, &record);
        events::award_validated(&env, tender_id, receipt_id, selected_bid_commitment);
    }

    pub fn finalize_award_from_verification(
        env: Env,
        admin: Address,
        tender_id: String,
        selected_supplier_index: u32,
        selected_bid_commitment: Bytes,
        receipt_id: String,
        receipt_nonce: Bytes,
        context_commitment: Bytes,
    ) {
        admin.require_auth();
        let mut record = read_tender(&env, &tender_id);
        require_admin(&record, &admin);
        require_status(&record, TenderStatus::EvaluationInProgress);
        if record.validated_winner_commitment.is_some() {
            panic!("award already validated");
        }
        if record.bid_commitments.len() != 3 {
            panic!("exactly three bid commitments required");
        }
        if selected_supplier_index >= record.bid_commitments.len() {
            panic!("selected supplier index out of range");
        }
        let indexed_commitment = record.bid_commitments.get(selected_supplier_index).unwrap();
        if indexed_commitment != selected_bid_commitment {
            panic!("selected commitment does not match supplier index");
        }

        let expected_context = compute_groth16_context_commitment(
            &env,
            &record,
            selected_supplier_index,
            &selected_bid_commitment,
            &receipt_nonce,
        );
        if expected_context != context_commitment {
            panic!("verification context commitment mismatch");
        }

        let registry_address = env.current_contract_address();
        env.authorize_as_current_contract(vec![
            &env,
            InvokerContractAuthEntry::Contract(SubContractInvocation {
                context: ContractContext {
                    contract: record.verifier_contract.clone(),
                    fn_name: Symbol::new(&env, "consume_verification_receipt"),
                    args: vec![
                        &env,
                        context_commitment.clone().into_val(&env),
                        registry_address.clone().into_val(&env),
                    ],
                },
                sub_invocations: vec![&env],
            }),
        ]);

        let verifier_receipt: VerificationReceipt = env.invoke_contract(
            &record.verifier_contract,
            &Symbol::new(&env, "consume_verification_receipt"),
            (context_commitment.clone(), registry_address).into_val(&env),
        );
        if !verifier_receipt.verified {
            panic!("verification receipt was not verified");
        }
        if verifier_receipt.context_commitment != context_commitment {
            panic!("verification receipt context mismatch");
        }
        if !verifier_receipt.consumed {
            panic!("verification receipt was not consumed");
        }

        let finalized_at = env.ledger().timestamp();
        let fair_receipt = FairAwardReceipt {
            receipt_id: receipt_id.clone(),
            tender_id: tender_id.clone(),
            selected_supplier_index,
            selected_bid_commitment: selected_bid_commitment.clone(),
            policy_version: record.policy_version.clone(),
            context_commitment: context_commitment.clone(),
            verifier_contract: record.verifier_contract.clone(),
            verifier_version: verifier_receipt.verifier_version,
            finalized_at,
            payment_status: PaymentStatus::ReadyForControlledRelease,
        };
        write_fair_award_receipt(&env, &fair_receipt);

        record.status = TenderStatus::Validated;
        record.validated_winner_commitment = Some(selected_bid_commitment.clone());
        record.award_receipt_id = Some(receipt_id.clone());
        record.validation_timestamp = Some(finalized_at);
        record.payment_status = PaymentStatus::ReadyForControlledRelease;
        write_tender(&env, &record);
        events::proof_backed_award_finalized(
            &env,
            tender_id,
            receipt_id,
            selected_bid_commitment,
            context_commitment,
        );
    }

    pub fn get_tender(env: Env, tender_id: String) -> TenderRecord {
        read_tender(&env, &tender_id)
    }

    pub fn get_bid_commitments(env: Env, tender_id: String) -> Vec<Bytes> {
        read_tender(&env, &tender_id).bid_commitments
    }

    pub fn get_award_receipt(env: Env, tender_id: String) -> Option<String> {
        read_tender(&env, &tender_id).award_receipt_id
    }

    pub fn get_fair_award_receipt(env: Env, receipt_id: String) -> FairAwardReceipt {
        read_fair_award_receipt(&env, &receipt_id)
    }
}

fn require_admin(record: &TenderRecord, admin: &Address) {
    if &record.admin != admin {
        panic!("admin authorization mismatch");
    }
}

fn require_status(record: &TenderRecord, expected: TenderStatus) {
    if record.status != expected {
        panic!("unexpected tender lifecycle status");
    }
}

fn require_public_inputs_match_record(
    env: &Env,
    record: &TenderRecord,
    selected_bid_commitment: &Bytes,
    receipt_nonce: &Bytes,
    public_inputs: &Bytes,
) {
    if public_inputs.len() != 288 {
        panic!("expected nine 32-byte public inputs");
    }
    if receipt_nonce.len() != 32 {
        panic!("receipt nonce must be a 32-byte field");
    }
    if selected_bid_commitment.len() != 32
        || record.policy_commitment.len() != 32
        || record.bid_commitments.len() != 3
    {
        panic!("stored commitments must be 32-byte fields");
    }

    let selected_index = field_from_u32(env, 1);
    let tender_ref = field_from_u32(env, 2_026_041);
    let policy_version = field_from_u32(env, 1);

    require_public_field(
        env,
        public_inputs,
        0,
        &selected_index,
        "selected supplier index mismatch",
    );
    require_public_field(
        env,
        public_inputs,
        1,
        &tender_ref,
        "tender reference mismatch",
    );
    require_public_field(
        env,
        public_inputs,
        2,
        receipt_nonce,
        "receipt nonce mismatch",
    );
    require_public_field(
        env,
        public_inputs,
        3,
        &policy_version,
        "policy version mismatch",
    );
    require_public_field(
        env,
        public_inputs,
        4,
        &record.policy_commitment,
        "policy commitment mismatch",
    );
    require_public_field(
        env,
        public_inputs,
        5,
        &record.bid_commitments.get(0).unwrap(),
        "atlas commitment mismatch",
    );
    require_public_field(
        env,
        public_inputs,
        6,
        &record.bid_commitments.get(1).unwrap(),
        "nova commitment mismatch",
    );
    require_public_field(
        env,
        public_inputs,
        7,
        &record.bid_commitments.get(2).unwrap(),
        "meridian commitment mismatch",
    );
    require_public_field(
        env,
        public_inputs,
        8,
        selected_bid_commitment,
        "selected commitment mismatch",
    );
}

fn require_public_field(
    env: &Env,
    public_inputs: &Bytes,
    index: u32,
    expected: &Bytes,
    message: &str,
) {
    let mut all = [0u8; 288];
    public_inputs.copy_into_slice(&mut all);
    let start = (index as usize) * 32;
    let actual = Bytes::from_slice(env, &all[start..start + 32]);
    if &actual != expected {
        panic!("{}", message);
    }
}

fn field_from_u32(env: &Env, value: u32) -> Bytes {
    let mut out = [0u8; 32];
    out[28] = ((value >> 24) & 0xff) as u8;
    out[29] = ((value >> 16) & 0xff) as u8;
    out[30] = ((value >> 8) & 0xff) as u8;
    out[31] = (value & 0xff) as u8;
    Bytes::from_array(env, &out)
}

fn compute_groth16_context_commitment(
    env: &Env,
    record: &TenderRecord,
    selected_supplier_index: u32,
    selected_bid_commitment: &Bytes,
    receipt_nonce: &Bytes,
) -> Bytes {
    if receipt_nonce.len() != 32 {
        panic!("receipt nonce must be a 32-byte field");
    }
    if selected_bid_commitment.len() != 32 || record.policy_commitment.len() != 32 {
        panic!("commitments must be 32-byte fields");
    }

    let values = vec![
        env,
        field_from_u32_fr(env, 3001),
        field_from_u32_fr(env, selected_supplier_index),
        field_from_u32_fr(env, 2_026_041),
        fr_from_bytes(env, receipt_nonce),
        field_from_u32_fr(env, 1),
        fr_from_bytes(env, &record.policy_commitment),
        fr_from_bytes(env, &record.bid_commitments.get(0).unwrap()),
        fr_from_bytes(env, &record.bid_commitments.get(1).unwrap()),
        fr_from_bytes(env, &record.bid_commitments.get(2).unwrap()),
        fr_from_bytes(env, selected_bid_commitment),
    ];

    let mut current = hash2(env, values.get(0).unwrap(), values.get(1).unwrap());
    let mut index = 2;
    while index < values.len() {
        current = hash2(env, current, values.get(index).unwrap());
        index += 1;
    }
    bytes_from_fr(env, &current)
}

fn hash2(env: &Env, a: Bls12381Fr, b: Bls12381Fr) -> Bls12381Fr {
    let left = a * field_from_u32_fr(env, 1_315_423_911);
    let right = b * field_from_u32_fr(env, 2_654_435_761);
    left + right + field_from_u32_fr(env, 97)
}

fn fr_from_bytes(env: &Env, bytes: &Bytes) -> Bls12381Fr {
    if bytes.len() != 32 {
        panic!("expected 32-byte field");
    }
    let mut out = [0u8; 32];
    bytes.copy_into_slice(&mut out);
    Bls12381Fr::from_bytes(BytesN::from_array(env, &out))
}

fn field_from_u32_fr(env: &Env, value: u32) -> Bls12381Fr {
    fr_from_bytes(env, &field_from_u32(env, value))
}

fn bytes_from_fr(env: &Env, value: &Bls12381Fr) -> Bytes {
    Bytes::from_array(env, &value.to_bytes().to_array())
}

#[cfg(test)]
mod test {
    extern crate std;

    use super::*;
    use soroban_sdk::{
        contract, contractimpl, contracttype, testutils::Address as TestAddress, Address, Env,
        String,
    };

    #[contracttype]
    #[derive(Clone)]
    enum StubKey {
        Receipt(Bytes),
        Version,
    }

    #[contract]
    struct StubReceiptVerifier;

    #[contractimpl]
    impl StubReceiptVerifier {
        pub fn set_receipt(env: Env, context: Bytes, verifier_version: String) {
            env.storage()
                .persistent()
                .set(&StubKey::Receipt(context), &false);
            env.storage()
                .persistent()
                .set(&StubKey::Version, &verifier_version);
        }

        pub fn consume_verification_receipt(
            env: Env,
            context_commitment: Bytes,
            registry: Address,
        ) -> VerificationReceipt {
            registry.require_auth();
            let key = StubKey::Receipt(context_commitment.clone());
            let consumed: bool = env
                .storage()
                .persistent()
                .get(&key)
                .expect("verification receipt not found");
            if consumed {
                panic!("verification receipt already consumed");
            }
            env.storage().persistent().set(&key, &true);
            VerificationReceipt {
                context_commitment,
                verified: true,
                verified_at: env.ledger().timestamp(),
                verifier_version: env.storage().persistent().get(&StubKey::Version).unwrap(),
                consumed: true,
            }
        }
    }

    fn fixture_bytes(env: &Env, raw: &[u8]) -> Bytes {
        Bytes::from_slice(env, raw)
    }

    fn setup_with_verifier<'a>(
        env: &'a Env,
        verifier_id: &Address,
    ) -> (OforaRegistryClient<'a>, Address) {
        env.mock_all_auths();
        let registry_id = env.register(OforaRegistry, ());
        let registry = OforaRegistryClient::new(env, &registry_id);
        let admin = Address::generate(env);

        registry.initialize_tender(
            &admin,
            &String::from_str(env, "OFR-2026-041"),
            &fixture_bytes(
                env,
                include_bytes!(
                    "../../../artifacts/ofora-groth16-demo/groth16-policy-commitment.bin"
                ),
            ),
            &String::from_str(env, "1"),
            &1_800_000_000,
            verifier_id,
        );
        registry.lock_policy(&admin, &String::from_str(env, "OFR-2026-041"));
        registry.register_bid_commitment(
            &admin,
            &String::from_str(env, "OFR-2026-041"),
            &fixture_bytes(
                env,
                include_bytes!(
                    "../../../artifacts/ofora-groth16-demo/groth16-atlas-bid-commitment.bin"
                ),
            ),
        );
        registry.register_bid_commitment(
            &admin,
            &String::from_str(env, "OFR-2026-041"),
            &fixture_bytes(
                env,
                include_bytes!(
                    "../../../artifacts/ofora-groth16-demo/groth16-nova-bid-commitment.bin"
                ),
            ),
        );
        registry.register_bid_commitment(
            &admin,
            &String::from_str(env, "OFR-2026-041"),
            &fixture_bytes(
                env,
                include_bytes!(
                    "../../../artifacts/ofora-groth16-demo/groth16-meridian-bid-commitment.bin"
                ),
            ),
        );
        registry.begin_evaluation(&admin, &String::from_str(env, "OFR-2026-041"));
        (registry, admin)
    }

    fn setup(
        env: &Env,
    ) -> (
        OforaRegistryClient<'_>,
        StubReceiptVerifierClient<'_>,
        Address,
        Address,
    ) {
        let verifier_id = env.register(StubReceiptVerifier, ());
        let verifier = StubReceiptVerifierClient::new(env, &verifier_id);
        let (registry, admin) = setup_with_verifier(env, &verifier_id);
        (registry, verifier, admin, verifier_id)
    }

    #[test]
    fn finalizes_nova_award_from_consumed_verification_receipt() {
        let env = Env::default();
        let (registry, verifier, admin, _) = setup(&env);
        let context = fixture_bytes(
            &env,
            include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin"),
        );
        verifier.set_receipt(
            &context,
            &String::from_str(&env, "ofora-groth16-receipt-v1"),
        );

        registry.finalize_award_from_verification(
            &admin,
            &String::from_str(&env, "OFR-2026-041"),
            &1,
            &fixture_bytes(
                &env,
                include_bytes!(
                    "../../../artifacts/ofora-groth16-demo/groth16-nova-bid-commitment.bin"
                ),
            ),
            &String::from_str(&env, "FAR-OFR-2026-041-NOVA"),
            &fixture_bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/groth16-receipt-nonce.bin"),
            ),
            &context,
        );

        let tender = registry.get_tender(&String::from_str(&env, "OFR-2026-041"));
        assert_eq!(tender.status, TenderStatus::Validated);
        assert_eq!(
            tender.payment_status,
            PaymentStatus::ReadyForControlledRelease
        );
        let fair =
            registry.get_fair_award_receipt(&String::from_str(&env, "FAR-OFR-2026-041-NOVA"));
        assert_eq!(fair.selected_supplier_index, 1);
        assert_eq!(fair.context_commitment, context);
    }

    #[test]
    #[should_panic(expected = "verification context commitment mismatch")]
    fn rejects_atlas_selected_against_nova_receipt_context() {
        let env = Env::default();
        let (registry, _, admin, _) = setup(&env);
        registry.finalize_award_from_verification(
            &admin,
            &String::from_str(&env, "OFR-2026-041"),
            &0,
            &fixture_bytes(
                &env,
                include_bytes!(
                    "../../../artifacts/ofora-groth16-demo/groth16-atlas-bid-commitment.bin"
                ),
            ),
            &String::from_str(&env, "FAR-OFR-2026-041-ATLAS"),
            &fixture_bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/groth16-receipt-nonce.bin"),
            ),
            &fixture_bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin"),
            ),
        );
    }

    #[test]
    #[should_panic(expected = "verification context commitment mismatch")]
    fn rejects_meridian_selected_against_nova_receipt_context() {
        let env = Env::default();
        let (registry, _, admin, _) = setup(&env);
        registry.finalize_award_from_verification(
            &admin,
            &String::from_str(&env, "OFR-2026-041"),
            &2,
            &fixture_bytes(
                &env,
                include_bytes!(
                    "../../../artifacts/ofora-groth16-demo/groth16-meridian-bid-commitment.bin"
                ),
            ),
            &String::from_str(&env, "FAR-OFR-2026-041-MERIDIAN"),
            &fixture_bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/groth16-receipt-nonce.bin"),
            ),
            &fixture_bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin"),
            ),
        );
    }

    #[test]
    #[should_panic(expected = "verification receipt already consumed")]
    fn rejects_receipt_reuse_across_registry_instances() {
        let env = Env::default();
        let (registry, verifier, admin, verifier_id) = setup(&env);
        let context = fixture_bytes(
            &env,
            include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin"),
        );
        verifier.set_receipt(
            &context,
            &String::from_str(&env, "ofora-groth16-receipt-v1"),
        );

        registry.finalize_award_from_verification(
            &admin,
            &String::from_str(&env, "OFR-2026-041"),
            &1,
            &fixture_bytes(
                &env,
                include_bytes!(
                    "../../../artifacts/ofora-groth16-demo/groth16-nova-bid-commitment.bin"
                ),
            ),
            &String::from_str(&env, "FAR-OFR-2026-041-NOVA"),
            &fixture_bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/groth16-receipt-nonce.bin"),
            ),
            &context,
        );

        let (second_registry, second_admin) = setup_with_verifier(&env, &verifier_id);
        second_registry.finalize_award_from_verification(
            &second_admin,
            &String::from_str(&env, "OFR-2026-041"),
            &1,
            &fixture_bytes(
                &env,
                include_bytes!(
                    "../../../artifacts/ofora-groth16-demo/groth16-nova-bid-commitment.bin"
                ),
            ),
            &String::from_str(&env, "FAR-OFR-2026-041-NOVA-REUSE"),
            &fixture_bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/groth16-receipt-nonce.bin"),
            ),
            &context,
        );
    }
}
