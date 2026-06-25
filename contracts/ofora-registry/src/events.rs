use soroban_sdk::{contractevent, Bytes, Env, String};

#[contractevent(data_format = "vec")]
pub struct TenderInitialized {
    #[topic]
    pub tender_id: String,
}

#[contractevent(data_format = "vec")]
pub struct BidRegistered {
    #[topic]
    pub tender_id: String,
    pub bid_commitment: Bytes,
}

#[contractevent(data_format = "vec")]
pub struct AwardValidated {
    #[topic]
    pub tender_id: String,
    pub receipt_id: String,
    pub winner_commitment: Bytes,
}

pub fn tender_initialized(env: &Env, tender_id: String) {
    TenderInitialized { tender_id }.publish(env);
}

pub fn bid_registered(env: &Env, tender_id: String, bid_commitment: Bytes) {
    BidRegistered {
        tender_id,
        bid_commitment,
    }
    .publish(env);
}

pub fn award_validated(env: &Env, tender_id: String, receipt_id: String, winner_commitment: Bytes) {
    AwardValidated {
        tender_id,
        receipt_id,
        winner_commitment,
    }
    .publish(env);
}
