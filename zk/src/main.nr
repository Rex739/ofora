// Ofora MVP award-validation circuit.
//
// Fixed-scope statement for tender OFR-2026-041:
// selected supplier is eligible and has an integer score greater than or equal
// to every other eligible supplier under the locked policy. Commitments use
// Poseidon2 through the same dependency used by the verified UltraHonk Soroban
// reference workflow.

use dep::poseidon::poseidon2::Poseidon2;

struct Policy {
    tender_ref: Field,
    price_weight: u32,
    delivery_weight: u32,
    stock_weight: u32,
    quality_weight: u32,
    local_weight: u32,
    minimum_quality: u32,
    maximum_delivery_days: u32,
    budget_ceiling: u32,
    policy_version: Field,
}

struct Bid {
    tender_ref: Field,
    supplier_ref: Field,
    price: u32,
    delivery_days: u32,
    stock_availability: u32,
    quality_rating: u32,
    local_contribution: u32,
    salt: Field,
}

fn as_field(value: u32) -> Field {
    value as Field
}

fn hash2(a: Field, b: Field) -> Field {
    Poseidon2::hash([a, b], 2)
}

fn policy_commitment(policy: Policy) -> Field {
    let mut cur = hash2(1001, policy.tender_ref);
    cur = hash2(cur, as_field(policy.price_weight));
    cur = hash2(cur, as_field(policy.delivery_weight));
    cur = hash2(cur, as_field(policy.stock_weight));
    cur = hash2(cur, as_field(policy.quality_weight));
    cur = hash2(cur, as_field(policy.local_weight));
    cur = hash2(cur, as_field(policy.minimum_quality));
    cur = hash2(cur, as_field(policy.maximum_delivery_days));
    cur = hash2(cur, as_field(policy.budget_ceiling));
    hash2(cur, policy.policy_version)
}

fn bid_commitment(bid: Bid) -> Field {
    let mut cur = hash2(2001, bid.tender_ref);
    cur = hash2(cur, bid.supplier_ref);
    cur = hash2(cur, as_field(bid.price));
    cur = hash2(cur, as_field(bid.delivery_days));
    cur = hash2(cur, as_field(bid.stock_availability));
    cur = hash2(cur, as_field(bid.quality_rating));
    cur = hash2(cur, as_field(bid.local_contribution));
    hash2(cur, bid.salt)
}

fn is_eligible(bid: Bid, policy: Policy) -> bool {
    bid.quality_rating >= policy.minimum_quality
        & bid.delivery_days <= policy.maximum_delivery_days
        & bid.price <= policy.budget_ceiling
}

fn min_price(a: u32, b: u32) -> u32 {
    if a < b {
        a
    } else {
        b
    }
}

fn lowest_eligible_price(policy: Policy, bid0: Bid, bid1: Bid, bid2: Bid) -> u32 {
    let mut lowest = policy.budget_ceiling;
    if is_eligible(bid0, policy) {
        lowest = min_price(lowest, bid0.price);
    }
    if is_eligible(bid1, policy) {
        lowest = min_price(lowest, bid1.price);
    }
    if is_eligible(bid2, policy) {
        lowest = min_price(lowest, bid2.price);
    }
    lowest
}

fn score(bid: Bid, policy: Policy, lowest_price: u32) -> u32 {
    // Component scores are scaled so 10000 represents 100.00 points. The
    // weighted score is private and used only for comparison.
    let price_component = (lowest_price * 10000) / bid.price;
    let delivery_component = ((policy.maximum_delivery_days - bid.delivery_days + 1) * 10000) / policy.maximum_delivery_days;
    let stock_component = bid.stock_availability * 100;
    let quality_component = bid.quality_rating * 100;
    let local_component = bid.local_contribution * 100;

    price_component * policy.price_weight
        + delivery_component * policy.delivery_weight
        + stock_component * policy.stock_weight
        + quality_component * policy.quality_weight
        + local_component * policy.local_weight
}

fn assert_selected(index: u32, selected_commitment: Field, bid0: Bid, bid1: Bid, bid2: Bid) -> Bid {
    if index == 0 {
        assert(selected_commitment == bid_commitment(bid0));
        bid0
    } else if index == 1 {
        assert(selected_commitment == bid_commitment(bid1));
        bid1
    } else {
        assert(index == 2);
        assert(selected_commitment == bid_commitment(bid2));
        bid2
    }
}

fn verification_context_commitment(
    tender_ref: Field,
    receipt_nonce: Field,
    policy_version: Field,
    policy_commitment_value: Field,
    bid_commitments_value: [Field; 3],
    selected_supplier_index: u32,
    selected_bid_commitment: Field
) -> Field {
    let mut cur = hash2(3001, tender_ref);
    cur = hash2(cur, receipt_nonce);
    cur = hash2(cur, policy_version);
    cur = hash2(cur, policy_commitment_value);
    cur = hash2(cur, bid_commitments_value[0]);
    cur = hash2(cur, bid_commitments_value[1]);
    cur = hash2(cur, bid_commitments_value[2]);
    cur = hash2(cur, as_field(selected_supplier_index));
    hash2(cur, selected_bid_commitment)
}

fn main(
    policy: Policy,
    bid0: Bid,
    bid1: Bid,
    bid2: Bid,
    selected_supplier_index: u32,
    tender_ref: Field,
    receipt_nonce: Field,
    policy_version: Field,
    expected_policy_commitment: Field,
    bid_commitments: [Field; 3],
    selected_bid_commitment: Field,
    expected_verification_context: pub Field
) {
    assert(receipt_nonce != 0);
    assert(policy.tender_ref == tender_ref);
    assert(policy.policy_version == policy_version);
    assert(bid0.tender_ref == tender_ref);
    assert(bid1.tender_ref == tender_ref);
    assert(bid2.tender_ref == tender_ref);

    assert(policy_commitment(policy) == expected_policy_commitment);
    assert(bid_commitment(bid0) == bid_commitments[0]);
    assert(bid_commitment(bid1) == bid_commitments[1]);
    assert(bid_commitment(bid2) == bid_commitments[2]);
    assert(
        verification_context_commitment(
            tender_ref,
            receipt_nonce,
            policy_version,
            expected_policy_commitment,
            bid_commitments,
            selected_supplier_index,
            selected_bid_commitment
        ) == expected_verification_context
    );

    let selected = assert_selected(selected_supplier_index, selected_bid_commitment, bid0, bid1, bid2);
    assert(is_eligible(selected, policy));

    let lowest_price = lowest_eligible_price(policy, bid0, bid1, bid2);
    let selected_score = score(selected, policy, lowest_price);

    if is_eligible(bid0, policy) {
        assert(selected_score >= score(bid0, policy, lowest_price));
    }
    if is_eligible(bid1, policy) {
        assert(selected_score >= score(bid1, policy, lowest_price));
    }
    if is_eligible(bid2, policy) {
        assert(selected_score >= score(bid2, policy, lowest_price));
    }
}
