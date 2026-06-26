use std::{
    env,
    fs::{self, File},
    io::Write,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};

use num_bigint::BigUint;
use num_traits::Zero;
use soroban_poseidon::{poseidon2_hash, Field};
use soroban_sdk::{crypto::bn254::Fr as BnScalar, testutils::EnvTestConfig, Env, Bytes, U256, Vec as SorobanVec};


#[derive(Clone)]
struct Policy {
    tender_ref: &'static str,
    tender_ref_field: &'static str,
    price_weight: u32,
    delivery_weight: u32,
    stock_weight: u32,
    quality_weight: u32,
    local_weight: u32,
    minimum_quality: u32,
    maximum_delivery_days: u32,
    budget_ceiling: u32,
    policy_version: &'static str,
}

#[derive(Clone)]
struct Bid {
    supplier_ref: &'static str,
    price: u32,
    delivery_days: u32,
    stock_availability: u32,
    quality_rating: u32,
    local_contribution: u32,
    salt: BigUint,
}

fn main() {
    let root = PathBuf::from(env::var("OFORA_ROOT").unwrap_or_else(|_| ".".to_string()));
    let private_dir = root.join("artifacts/private/ofora-award-proof");
    let public_dir = root.join("artifacts/ofora-zk-demo");
    fs::create_dir_all(&private_dir).expect("create private artifact dir");
    fs::create_dir_all(&public_dir).expect("create public artifact dir");

    let mut config = EnvTestConfig::default();
    config.capture_snapshot_at_drop = false;
    let env = Env::new_with_config(config);

    let policy = Policy {
        tender_ref: "OFR-2026-041",
        tender_ref_field: "2026041",
        price_weight: 35,
        delivery_weight: 25,
        stock_weight: 20,
        quality_weight: 10,
        local_weight: 10,
        minimum_quality: 75,
        maximum_delivery_days: 14,
        budget_ceiling: 10000,
        policy_version: "1",
    };

    let salt_seed = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time")
        .as_nanos();
    let bids = vec![
        Bid { supplier_ref: "1", price: 8900, delivery_days: 9, stock_availability: 100, quality_rating: 82, local_contribution: 70, salt: salt_from_env("OFORA_ATLAS_SALT", salt_seed + 11) },
        Bid { supplier_ref: "2", price: 9400, delivery_days: 7, stock_availability: 100, quality_rating: 91, local_contribution: 88, salt: salt_from_env("OFORA_NOVA_SALT", salt_seed + 22) },
        Bid { supplier_ref: "3", price: 8100, delivery_days: 18, stock_availability: 100, quality_rating: 80, local_contribution: 60, salt: salt_from_env("OFORA_MERIDIAN_SALT", salt_seed + 33) },
    ];

    let policy_commitment = policy_commitment(&env, &policy);
    let bid_commitments = bids
        .iter()
        .map(|bid| bid_commitment(&env, &policy, bid))
        .collect::<Vec<_>>();
    let receipt_nonce = env::var("OFORA_RECEIPT_NONCE").unwrap_or_else(|_| "2026041001".to_string());
    let receipt_id = "FAR-OFR-2026-041-001";
    let selected_supplier_index = 1u32;
    let selected_bid_commitment = bid_commitments[selected_supplier_index as usize].clone();
    let verification_context = verification_context_commitment(
        &env,
        &policy,
        &receipt_nonce,
        &policy_commitment,
        &bid_commitments,
        selected_supplier_index,
        &selected_bid_commitment,
    );

    write_public_artifacts(&public_dir, &policy, &policy_commitment, &bid_commitments, &receipt_nonce, receipt_id, &verification_context);
    write_witness(&private_dir.join("Prover.nova.toml"), &policy, &bids, 1, &receipt_nonce, &policy_commitment, &bid_commitments, &verification_context);
    write_witness(&private_dir.join("Prover.atlas.toml"), &policy, &bids, 0, &receipt_nonce, &policy_commitment, &bid_commitments, &verification_context);
    write_witness(&private_dir.join("Prover.meridian.toml"), &policy, &bids, 2, &receipt_nonce, &policy_commitment, &bid_commitments, &verification_context);

    println!("policyCommitment={policy_commitment}");
    println!("atlasBidCommitment={}", bid_commitments[0]);
    println!("novaBidCommitment={}", bid_commitments[1]);
    println!("meridianBidCommitment={}", bid_commitments[2]);
    println!("verificationContextCommitment={verification_context}");
    println!("privateWitnessDir={}", private_dir.display());
    println!("publicArtifactDir={}", public_dir.display());
}

fn salt_from_env(name: &str, fallback: u128) -> BigUint {
    env::var(name)
        .ok()
        .and_then(|value| BigUint::parse_bytes(value.as_bytes(), 10))
        .unwrap_or_else(|| BigUint::from(fallback))
}

fn biguint_from_dec(value: &str) -> BigUint {
    BigUint::parse_bytes(value.as_bytes(), 10).expect("decimal field")
}

fn field_hash2(env: &Env, a: &BigUint, b: &BigUint) -> BigUint {
    let a_bytes = Bytes::from_array(env, &be32_from_biguint(a));
    let b_bytes = Bytes::from_array(env, &be32_from_biguint(b));
    let modulus = <BnScalar as Field>::modulus(env);
    let mut inputs = SorobanVec::new(env);
    inputs.push_back(U256::from_be_bytes(env, &a_bytes).rem_euclid(&modulus));
    inputs.push_back(U256::from_be_bytes(env, &b_bytes).rem_euclid(&modulus));
    let out = poseidon2_hash::<4, BnScalar>(env, &inputs);
    let out_bytes = out.to_be_bytes();
    let mut out_arr = [0u8; 32];
    out_bytes.copy_into_slice(&mut out_arr);
    BigUint::from_bytes_be(&out_arr)
}

fn be32_from_biguint(n: &BigUint) -> [u8; 32] {
    let mut out = [0u8; 32];
    if n.is_zero() {
        return out;
    }
    let be = n.to_bytes_be();
    let start = 32usize.checked_sub(be.len()).expect("field too wide");
    out[start..].copy_from_slice(&be);
    out
}

fn policy_commitment(env: &Env, policy: &Policy) -> BigUint {
    let mut cur = field_hash2(env, &BigUint::from(1001u32), &biguint_from_dec(policy.tender_ref_field));
    for value in [
        policy.price_weight,
        policy.delivery_weight,
        policy.stock_weight,
        policy.quality_weight,
        policy.local_weight,
        policy.minimum_quality,
        policy.maximum_delivery_days,
        policy.budget_ceiling,
    ] {
        cur = field_hash2(env, &cur, &BigUint::from(value));
    }
    field_hash2(env, &cur, &biguint_from_dec(policy.policy_version))
}

fn bid_commitment(env: &Env, policy: &Policy, bid: &Bid) -> BigUint {
    let mut cur = field_hash2(env, &BigUint::from(2001u32), &biguint_from_dec(policy.tender_ref_field));
    cur = field_hash2(env, &cur, &biguint_from_dec(bid.supplier_ref));
    for value in [bid.price, bid.delivery_days, bid.stock_availability, bid.quality_rating, bid.local_contribution] {
        cur = field_hash2(env, &cur, &BigUint::from(value));
    }
    field_hash2(env, &cur, &bid.salt)
}

fn verification_context_commitment(
    env: &Env,
    policy: &Policy,
    receipt_nonce: &str,
    policy_commitment: &BigUint,
    bid_commitments: &[BigUint],
    selected_supplier_index: u32,
    selected_bid_commitment: &BigUint,
) -> BigUint {
    let mut cur = field_hash2(env, &BigUint::from(3001u32), &biguint_from_dec(policy.tender_ref_field));
    cur = field_hash2(env, &cur, &biguint_from_dec(receipt_nonce));
    cur = field_hash2(env, &cur, &biguint_from_dec(policy.policy_version));
    cur = field_hash2(env, &cur, policy_commitment);
    cur = field_hash2(env, &cur, &bid_commitments[0]);
    cur = field_hash2(env, &cur, &bid_commitments[1]);
    cur = field_hash2(env, &cur, &bid_commitments[2]);
    cur = field_hash2(env, &cur, &BigUint::from(selected_supplier_index));
    field_hash2(env, &cur, selected_bid_commitment)
}

fn write_public_artifacts(
    public_dir: &PathBuf,
    policy: &Policy,
    policy_commitment: &BigUint,
    bid_commitments: &[BigUint],
    receipt_nonce: &str,
    receipt_id: &str,
    verification_context: &BigUint,
) {
    write_json(
        &public_dir.join("policy-commitment.json"),
        &format!(
            "{{\n  \"tenderReference\": \"{}\",\n  \"policyVersion\": \"{}\",\n  \"commitment\": \"{}\"\n}}\n",
            policy.tender_ref, policy.policy_version, policy_commitment
        ),
    );
    write_json(
        &public_dir.join("bid-commitments.json"),
        &format!(
            "{{\n  \"tenderReference\": \"{}\",\n  \"commitments\": [\n    {{ \"supplier\": \"{}\", \"commitment\": \"{}\" }},\n    {{ \"supplier\": \"{}\", \"commitment\": \"{}\" }},\n    {{ \"supplier\": \"{}\", \"commitment\": \"{}\" }}\n  ]\n}}\n",
            policy.tender_ref,
            bids_label(0),
            bid_commitments[0],
            bids_label(1),
            bid_commitments[1],
            bids_label(2),
            bid_commitments[2]
        ),
    );
    write_json(
        &public_dir.join("public-inputs.json"),
        &format!(
            "{{\n  \"ordering\": [\"verification_context_commitment\"],\n  \"verification_context_commitment\": \"{}\",\n  \"context\": {{\n    \"selected_supplier_index\": \"1\",\n    \"tender_ref\": \"{}\",\n    \"receipt_nonce\": \"{}\",\n    \"policy_version\": \"{}\",\n    \"expected_policy_commitment\": \"{}\",\n    \"bid_commitments\": [\"{}\", \"{}\", \"{}\"],\n    \"selected_bid_commitment\": \"{}\"\n  }}\n}}\n",
            verification_context,
            policy.tender_ref_field,
            receipt_nonce,
            policy.policy_version,
            policy_commitment,
            bid_commitments[0],
            bid_commitments[1],
            bid_commitments[2],
            bid_commitments[1]
        ),
    );
    write_json(
        &public_dir.join("fair-award-receipt.json"),
        &format!(
            "{{\n  \"receiptId\": \"{}\",\n  \"tenderReference\": \"{}\",\n  \"awardedSupplier\": \"Nova Relief Systems\",\n  \"status\": \"pending-testnet-validation\"\n}}\n",
            receipt_id, policy.tender_ref
        ),
    );
}

fn bids_label(index: usize) -> &'static str {
    match index {
        0 => "Atlas Supply Group",
        1 => "Nova Relief Systems",
        _ => "Meridian Industrial Ltd.",
    }
}

fn write_witness(
    path: &PathBuf,
    policy: &Policy,
    bids: &[Bid],
    selected_index: u32,
    receipt_nonce: &str,
    policy_commitment: &BigUint,
    bid_commitments: &[BigUint],
    verification_context: &BigUint,
) {
    let selected_commitment = &bid_commitments[selected_index as usize];
    let mut out = String::new();
    out.push_str(&format!(
        "selected_supplier_index = \"{}\"\ntender_ref = \"{}\"\nreceipt_nonce = \"{}\"\npolicy_version = \"{}\"\nexpected_policy_commitment = \"{}\"\nbid_commitments = [\"{}\", \"{}\", \"{}\"]\nselected_bid_commitment = \"{}\"\nexpected_verification_context = \"{}\"\n\n",
        selected_index,
        policy.tender_ref_field,
        receipt_nonce,
        policy.policy_version,
        policy_commitment,
        bid_commitments[0],
        bid_commitments[1],
        bid_commitments[2],
        selected_commitment,
        verification_context
    ));
    out.push_str(&format!(
        "[policy]\ntender_ref = \"{}\"\nprice_weight = \"{}\"\ndelivery_weight = \"{}\"\nstock_weight = \"{}\"\nquality_weight = \"{}\"\nlocal_weight = \"{}\"\nminimum_quality = \"{}\"\nmaximum_delivery_days = \"{}\"\nbudget_ceiling = \"{}\"\npolicy_version = \"{}\"\n\n",
        policy.tender_ref_field,
        policy.price_weight,
        policy.delivery_weight,
        policy.stock_weight,
        policy.quality_weight,
        policy.local_weight,
        policy.minimum_quality,
        policy.maximum_delivery_days,
        policy.budget_ceiling,
        policy.policy_version
    ));
    for (index, bid) in bids.iter().enumerate() {
        out.push_str(&format!(
            "[bid{}]\ntender_ref = \"{}\"\nsupplier_ref = \"{}\"\nprice = \"{}\"\ndelivery_days = \"{}\"\nstock_availability = \"{}\"\nquality_rating = \"{}\"\nlocal_contribution = \"{}\"\nsalt = \"{}\"\n\n",
            index,
            policy.tender_ref_field,
            bid.supplier_ref,
            bid.price,
            bid.delivery_days,
            bid.stock_availability,
            bid.quality_rating,
            bid.local_contribution,
            bid.salt
        ));
    }
    let mut file = File::create(path).expect("create witness");
    file.write_all(out.as_bytes()).expect("write witness");
}

fn write_json(path: &PathBuf, content: &str) {
    let mut file = File::create(path).expect("create public artifact");
    file.write_all(content.as_bytes()).expect("write public artifact");
}
