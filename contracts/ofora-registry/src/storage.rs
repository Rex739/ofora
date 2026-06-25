use soroban_sdk::{Env, String};

use crate::types::{DataKey, TenderRecord};

pub fn read_tender(env: &Env, tender_id: &String) -> TenderRecord {
    env.storage()
        .persistent()
        .get(&DataKey::Tender(tender_id.clone()))
        .expect("tender record not found")
}

pub fn has_tender(env: &Env, tender_id: &String) -> bool {
    env.storage()
        .persistent()
        .has(&DataKey::Tender(tender_id.clone()))
}

pub fn write_tender(env: &Env, tender: &TenderRecord) {
    env.storage()
        .persistent()
        .set(&DataKey::Tender(tender.tender_id.clone()), tender);
}
