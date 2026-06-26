#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    crypto::bls12_381::{Fr, G1Affine, G2Affine, G1_SERIALIZED_SIZE, G2_SERIALIZED_SIZE},
    vec, Address, Bytes, BytesN, Env, String, Vec,
};

const FR_BYTES: usize = 32;
const PUBLIC_INPUTS: usize = 1;
const VK_BYTES: usize = G1_SERIALIZED_SIZE + (G2_SERIALIZED_SIZE * 3) + (G1_SERIALIZED_SIZE * 2);
const PROOF_BYTES: usize = (G1_SERIALIZED_SIZE * 2) + G2_SERIALIZED_SIZE;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    MalformedVerificationKey = 1,
    MalformedProof = 2,
    MalformedPublicSignals = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VerificationReceipt {
    pub context_commitment: Bytes,
    pub verified: bool,
    pub verified_at: u64,
    pub verifier_version: String,
    pub consumed: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    AuthorizedRegistry,
    Receipt(Bytes),
    VerifierVersion,
}

#[contract]
pub struct OforaGroth16Verifier;

#[contractimpl]
impl OforaGroth16Verifier {
    pub fn initialize(env: Env, admin: Address, verifier_version: String) {
        admin.require_auth();
        if env.storage().persistent().has(&DataKey::Admin) {
            panic!("verifier already initialized");
        }
        env.storage().persistent().set(&DataKey::Admin, &admin);
        env.storage()
            .persistent()
            .set(&DataKey::VerifierVersion, &verifier_version);
    }

    pub fn set_authorized_registry(env: Env, admin: Address, registry: Address) {
        admin.require_auth();
        let stored_admin: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Admin)
            .expect("verifier is not initialized");
        if stored_admin != admin {
            panic!("admin authorization mismatch");
        }
        env.storage()
            .persistent()
            .set(&DataKey::AuthorizedRegistry, &registry);
    }

    pub fn get_authorized_registry(env: Env) -> Option<Address> {
        env.storage().persistent().get(&DataKey::AuthorizedRegistry)
    }

    pub fn verify_and_record(
        env: Env,
        context_commitment: Bytes,
        vk_bytes: Bytes,
        proof_bytes: Bytes,
    ) -> bool {
        if context_commitment.len() != (PUBLIC_INPUTS * FR_BYTES) as u32 {
            panic!("verification context commitment must be one field");
        }
        if env
            .storage()
            .persistent()
            .has(&DataKey::Receipt(context_commitment.clone()))
        {
            panic!("verification receipt already exists");
        }

        let verified = Self::verify_proof(
            env.clone(),
            vk_bytes,
            proof_bytes,
            context_commitment.clone(),
        )
        .unwrap_or(false);
        if !verified {
            panic!("proof rejected");
        }

        let version: String = env
            .storage()
            .persistent()
            .get(&DataKey::VerifierVersion)
            .expect("verifier is not initialized");
        let receipt = VerificationReceipt {
            context_commitment: context_commitment.clone(),
            verified: true,
            verified_at: env.ledger().timestamp(),
            verifier_version: version,
            consumed: false,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Receipt(context_commitment), &receipt);
        true
    }

    pub fn get_verification_receipt(
        env: Env,
        context_commitment: Bytes,
    ) -> Option<VerificationReceipt> {
        env.storage()
            .persistent()
            .get(&DataKey::Receipt(context_commitment))
    }

    pub fn consume_verification_receipt(
        env: Env,
        context_commitment: Bytes,
        registry: Address,
    ) -> VerificationReceipt {
        registry.require_auth();
        let authorized: Address = env
            .storage()
            .persistent()
            .get(&DataKey::AuthorizedRegistry)
            .expect("authorized registry is not configured");
        if authorized != registry {
            panic!("registry is not authorized");
        }

        let key = DataKey::Receipt(context_commitment.clone());
        let mut receipt: VerificationReceipt = env
            .storage()
            .persistent()
            .get(&key)
            .expect("verification receipt not found");
        if receipt.context_commitment != context_commitment {
            panic!("receipt context mismatch");
        }
        if !receipt.verified {
            panic!("verification receipt is not verified");
        }
        if receipt.consumed {
            panic!("verification receipt already consumed");
        }

        receipt.consumed = true;
        env.storage().persistent().set(&key, &receipt);
        receipt
    }

    pub fn verify(
        env: Env,
        vk_bytes: Bytes,
        proof_bytes: Bytes,
        public_signal_bytes: Bytes,
    ) -> bool {
        Self::verify_proof(env, vk_bytes, proof_bytes, public_signal_bytes).unwrap_or(false)
    }

    pub fn verify_proof(
        env: Env,
        vk_bytes: Bytes,
        proof_bytes: Bytes,
        public_signal_bytes: Bytes,
    ) -> Result<bool, Error> {
        if vk_bytes.len() != VK_BYTES as u32 {
            return Err(Error::MalformedVerificationKey);
        }
        if proof_bytes.len() != PROOF_BYTES as u32 {
            return Err(Error::MalformedProof);
        }
        if public_signal_bytes.len() != (PUBLIC_INPUTS * FR_BYTES) as u32 {
            return Err(Error::MalformedPublicSignals);
        }

        let alpha = read_g1(&env, &vk_bytes, 0);
        let beta = read_g2(&env, &vk_bytes, G1_SERIALIZED_SIZE);
        let gamma = read_g2(&env, &vk_bytes, G1_SERIALIZED_SIZE + G2_SERIALIZED_SIZE);
        let delta = read_g2(&env, &vk_bytes, G1_SERIALIZED_SIZE + G2_SERIALIZED_SIZE * 2);
        let ic0 = read_g1(&env, &vk_bytes, G1_SERIALIZED_SIZE + G2_SERIALIZED_SIZE * 3);
        let ic1 = read_g1(
            &env,
            &vk_bytes,
            G1_SERIALIZED_SIZE + G2_SERIALIZED_SIZE * 3 + G1_SERIALIZED_SIZE,
        );

        let proof_a = read_g1(&env, &proof_bytes, 0);
        let proof_b = read_g2(&env, &proof_bytes, G1_SERIALIZED_SIZE);
        let proof_c = read_g1(&env, &proof_bytes, G1_SERIALIZED_SIZE + G2_SERIALIZED_SIZE);
        let public_signal = read_fr(&env, &public_signal_bytes, 0);

        let bls = env.crypto().bls12_381();
        let vk_x = bls.g1_add(&ic0, &bls.g1_mul(&ic1, &public_signal));
        let neg_a = -proof_a;

        let vp1: Vec<G1Affine> = vec![&env, neg_a, alpha, vk_x, proof_c];
        let vp2: Vec<G2Affine> = vec![&env, proof_b, beta, gamma, delta];
        Ok(bls.pairing_check(vp1, vp2))
    }
}

fn read_g1(env: &Env, bytes: &Bytes, offset: usize) -> G1Affine {
    let mut out = [0u8; G1_SERIALIZED_SIZE];
    bytes
        .slice(offset as u32..(offset + G1_SERIALIZED_SIZE) as u32)
        .copy_into_slice(&mut out);
    G1Affine::from_array(env, &out)
}

fn read_g2(env: &Env, bytes: &Bytes, offset: usize) -> G2Affine {
    let mut out = [0u8; G2_SERIALIZED_SIZE];
    bytes
        .slice(offset as u32..(offset + G2_SERIALIZED_SIZE) as u32)
        .copy_into_slice(&mut out);
    G2Affine::from_array(env, &out)
}

fn read_fr(env: &Env, bytes: &Bytes, offset: usize) -> Fr {
    let mut out = [0u8; FR_BYTES];
    bytes
        .slice(offset as u32..(offset + FR_BYTES) as u32)
        .copy_into_slice(&mut out);
    Fr::from_bytes(BytesN::from_array(env, &out))
}

#[cfg(test)]
mod test {
    extern crate std;

    use super::*;
    use soroban_sdk::{testutils::Address as TestAddress, Address, Bytes, Env, String};

    fn bytes(env: &Env, raw: &[u8]) -> Bytes {
        Bytes::from_slice(env, raw)
    }

    #[test]
    fn verifies_real_nova_proof() {
        let env = Env::default();
        let ok = OforaGroth16Verifier::verify(
            env.clone(),
            bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-vk.bin"),
            ),
            bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-proof.bin"),
            ),
            bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin"),
            ),
        );
        assert!(ok);
    }

    #[test]
    fn rejects_altered_public_signal() {
        let env = Env::default();
        let mut public =
            include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin").to_vec();
        public[31] ^= 1;
        let ok = OforaGroth16Verifier::verify(
            env.clone(),
            bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-vk.bin"),
            ),
            bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-proof.bin"),
            ),
            bytes(&env, &public),
        );
        assert!(!ok);
    }

    #[test]
    fn rejects_malformed_proof() {
        let env = Env::default();
        let ok = OforaGroth16Verifier::verify(
            env.clone(),
            bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-vk.bin"),
            ),
            bytes(&env, &[0u8; 12]),
            bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin"),
            ),
        );
        assert!(!ok);
    }

    fn client(env: &Env) -> (OforaGroth16VerifierClient<'_>, Address) {
        env.mock_all_auths();
        let id = env.register(OforaGroth16Verifier, ());
        let client = OforaGroth16VerifierClient::new(env, &id);
        let admin = Address::generate(env);
        client.initialize(&admin, &String::from_str(env, "ofora-groth16-receipt-v1"));
        (client, admin)
    }

    #[test]
    fn records_real_nova_verification_receipt() {
        let env = Env::default();
        let (client, _) = client(&env);

        assert!(client.verify_and_record(
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin")
            ),
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-vk.bin")
            ),
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-proof.bin")
            ),
        ));

        let receipt = client
            .get_verification_receipt(&bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin"),
            ))
            .unwrap();
        assert!(receipt.verified);
        assert!(!receipt.consumed);
        assert_eq!(
            receipt.context_commitment,
            bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin")
            )
        );
    }

    #[test]
    #[should_panic(expected = "verification receipt already exists")]
    fn rejects_duplicate_verification_receipt() {
        let env = Env::default();
        let (client, _) = client(&env);
        let public = bytes(
            &env,
            include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin"),
        );
        client.verify_and_record(
            &public,
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-vk.bin"),
            ),
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-proof.bin"),
            ),
        );
        client.verify_and_record(
            &public,
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-vk.bin"),
            ),
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-proof.bin"),
            ),
        );
    }

    #[test]
    #[should_panic(expected = "proof rejected")]
    fn rejects_atlas_context_with_nova_proof() {
        let env = Env::default();
        let (client, _) = client(&env);
        client.verify_and_record(
            &bytes(&env, include_bytes!("../../../artifacts/ofora-groth16-demo/groth16-atlas-verification-context-commitment.bin")),
            &bytes(&env, include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-vk.bin")),
            &bytes(&env, include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-proof.bin")),
        );
    }

    #[test]
    #[should_panic(expected = "proof rejected")]
    fn rejects_meridian_context_with_nova_proof() {
        let env = Env::default();
        let (client, _) = client(&env);
        client.verify_and_record(
            &bytes(&env, include_bytes!("../../../artifacts/ofora-groth16-demo/groth16-meridian-verification-context-commitment.bin")),
            &bytes(&env, include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-vk.bin")),
            &bytes(&env, include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-proof.bin")),
        );
    }

    #[test]
    fn consumes_receipt_once_for_authorized_registry() {
        let env = Env::default();
        let (client, admin) = client(&env);
        let registry = Address::generate(&env);
        client.set_authorized_registry(&admin, &registry);
        let public = bytes(
            &env,
            include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin"),
        );
        client.verify_and_record(
            &public,
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-vk.bin"),
            ),
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-proof.bin"),
            ),
        );

        let receipt = client.consume_verification_receipt(&public, &registry);
        assert!(receipt.consumed);
        let stored = client.get_verification_receipt(&public).unwrap();
        assert!(stored.consumed);
    }

    #[test]
    #[should_panic(expected = "registry is not authorized")]
    fn rejects_unauthorized_registry_consumption() {
        let env = Env::default();
        let (client, admin) = client(&env);
        let registry = Address::generate(&env);
        let other = Address::generate(&env);
        client.set_authorized_registry(&admin, &registry);
        let public = bytes(
            &env,
            include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin"),
        );
        client.verify_and_record(
            &public,
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-vk.bin"),
            ),
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-proof.bin"),
            ),
        );
        client.consume_verification_receipt(&public, &other);
    }

    #[test]
    #[should_panic(expected = "verification receipt already consumed")]
    fn rejects_receipt_reuse() {
        let env = Env::default();
        let (client, admin) = client(&env);
        let registry = Address::generate(&env);
        client.set_authorized_registry(&admin, &registry);
        let public = bytes(
            &env,
            include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-public.bin"),
        );
        client.verify_and_record(
            &public,
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-vk.bin"),
            ),
            &bytes(
                &env,
                include_bytes!("../../../artifacts/ofora-groth16-demo/soroban-proof.bin"),
            ),
        );
        client.consume_verification_receipt(&public, &registry);
        client.consume_verification_receipt(&public, &registry);
    }
}
