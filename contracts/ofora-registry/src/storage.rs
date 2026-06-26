use soroban_sdk::{Env, String};

use crate::types::{DataKey, FairAwardReceipt, TenderRecord};

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

pub fn read_fair_award_receipt(env: &Env, receipt_id: &String) -> FairAwardReceipt {
    env.storage()
        .persistent()
        .get(&DataKey::FairAwardReceipt(receipt_id.clone()))
        .expect("fair award receipt not found")
}

pub fn write_fair_award_receipt(env: &Env, receipt: &FairAwardReceipt) {
    env.storage().persistent().set(
        &DataKey::FairAwardReceipt(receipt.receipt_id.clone()),
        receipt,
    );
}
