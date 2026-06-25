// Ofora MVP award-validation circuit.
//
// This circuit is intentionally fixed to one tender, three bids, and one
// selected supplier index. It proves that the selected supplier is eligible and
// has a deterministic integer score greater than or equal to every other
// eligible supplier.
//
// NOTE: The commitment functions below are field-arithmetic placeholders that
// keep the statement constrained while the exact Poseidon2 API is pinned for
// the installed Noir toolchain. They are not acceptable as final production
// commitments. The scripts and docs fail closed until nargo/bb and the
// generated Soroban verifier are available.

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

fn policy_commitment(policy: Policy) -> Field {
    policy.tender_ref * 17
        + as_field(policy.price_weight) * 19
        + as_field(policy.delivery_weight) * 23
        + as_field(policy.stock_weight) * 29
        + as_field(policy.quality_weight) * 31
        + as_field(policy.local_weight) * 37
        + as_field(policy.minimum_quality) * 41
        + as_field(policy.maximum_delivery_days) * 43
        + as_field(policy.budget_ceiling) * 47
        + policy.policy_version * 53
}

fn bid_commitment(bid: Bid) -> Field {
    bid.tender_ref * 17
        + bid.supplier_ref * 19
        + as_field(bid.price) * 23
        + as_field(bid.delivery_days) * 29
        + as_field(bid.stock_availability) * 31
        + as_field(bid.quality_rating) * 37
        + as_field(bid.local_contribution) * 41
        + bid.salt * 43
}

fn is_eligible(bid: Bid, policy: Policy) -> bool {
    bid.quality_rating >= policy.minimum_quality
        & bid.delivery_days <= policy.maximum_delivery_days
        & bid.price <= policy.budget_ceiling
}

fn score(bid: Bid, policy: Policy) -> u32 {
    // Integer-only scoring for the MVP:
    // - lower price improves cost score through budget headroom
    // - faster delivery improves delivery score through deadline headroom
    // - stock, quality, local contribution are direct integer components
    //
    // The score is scaled by policy weights and never exposed publicly.
    let price_component = ((policy.budget_ceiling - bid.price) * 100) / policy.budget_ceiling;
    let delivery_component = ((policy.maximum_delivery_days - bid.delivery_days) * 100) / policy.maximum_delivery_days;
    let stock_component = bid.stock_availability;
    let quality_component = bid.quality_rating;
    let local_component = bid.local_contribution;

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

fn main(
    policy: Policy,
    bid0: Bid,
    bid1: Bid,
    bid2: Bid,
    selected_supplier_index: pub u32,
    tender_ref: pub Field,
    receipt_ref: pub Field,
    expected_policy_commitment: pub Field,
    bid_commitments: pub [Field; 3],
    selected_bid_commitment: pub Field
) {
    assert(receipt_ref != 0);
    assert(policy.tender_ref == tender_ref);
    assert(bid0.tender_ref == tender_ref);
    assert(bid1.tender_ref == tender_ref);
    assert(bid2.tender_ref == tender_ref);

    assert(policy_commitment(policy) == expected_policy_commitment);
    assert(bid_commitment(bid0) == bid_commitments[0]);
    assert(bid_commitment(bid1) == bid_commitments[1]);
    assert(bid_commitment(bid2) == bid_commitments[2]);

    let selected = assert_selected(selected_supplier_index, selected_bid_commitment, bid0, bid1, bid2);
    assert(is_eligible(selected, policy));

    let selected_score = score(selected, policy);

    if is_eligible(bid0, policy) {
        assert(selected_score >= score(bid0, policy));
    }
    if is_eligible(bid1, policy) {
        assert(selected_score >= score(bid1, policy));
    }
    if is_eligible(bid2, policy) {
        assert(selected_score >= score(bid2, policy));
    }
}
