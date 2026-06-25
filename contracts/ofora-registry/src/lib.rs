#![no_std]

mod events;
mod storage;
mod types;

use soroban_sdk::{
    contract, contractimpl, symbol_short, Address, Bytes, Env, IntoVal, String, Vec,
};

use crate::storage::{has_tender, read_tender, write_tender};
use crate::types::{PaymentStatus, TenderRecord, TenderStatus};

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

    pub fn lock_policy(env: Env, admin: Address, tender_id: String) {
        admin.require_auth();
        let mut record = read_tender(&env, &tender_id);
        require_admin(&record, &admin);
        require_status(&record, TenderStatus::Draft);
        record.status = TenderStatus::Locked;
        write_tender(&env, &record);
    }

    pub fn register_bid_commitment(env: Env, tender_id: String, bid_commitment: Bytes) {
        let mut record = read_tender(&env, &tender_id);
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
        let record = read_tender(&env, &tender_id);
        require_admin(&record, &admin);
        require_status(&record, TenderStatus::EvaluationInProgress);
    }

    pub fn validate_award(
        env: Env,
        admin: Address,
        tender_id: String,
        selected_bid_commitment: Bytes,
        receipt_id: String,
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

        // The verifier contract must be the generated Noir UltraHonk Soroban
        // verifier deployed with the matching verification key. Its public API
        // follows the official reference wrapper: verify_proof(public_inputs,
        // proof_bytes) -> bool.
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

    pub fn get_tender(env: Env, tender_id: String) -> TenderRecord {
        read_tender(&env, &tender_id)
    }

    pub fn get_bid_commitments(env: Env, tender_id: String) -> Vec<Bytes> {
        read_tender(&env, &tender_id).bid_commitments
    }

    pub fn get_award_receipt(env: Env, tender_id: String) -> Option<String> {
        read_tender(&env, &tender_id).award_receipt_id
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
