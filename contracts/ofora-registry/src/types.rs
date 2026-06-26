use soroban_sdk::{contracttype, Address, Bytes, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TenderStatus {
    Draft,
    Locked,
    OpenForSubmissions,
    EvaluationInProgress,
    Validated,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PaymentStatus {
    NotReady,
    ReadyForControlledRelease,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TenderRecord {
    pub admin: Address,
    pub tender_id: String,
    pub policy_commitment: Bytes,
    pub policy_version: String,
    pub status: TenderStatus,
    pub submission_deadline: u64,
    pub max_bid_commitments: u32,
    pub bid_commitments: Vec<Bytes>,
    pub validated_winner_commitment: Option<Bytes>,
    pub award_receipt_id: Option<String>,
    pub validation_timestamp: Option<u64>,
    pub payment_status: PaymentStatus,
    pub verifier_contract: Address,
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
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FairAwardReceipt {
    pub receipt_id: String,
    pub tender_id: String,
    pub selected_supplier_index: u32,
    pub selected_bid_commitment: Bytes,
    pub policy_version: String,
    pub context_commitment: Bytes,
    pub verifier_contract: Address,
    pub verifier_version: String,
    pub finalized_at: u64,
    pub payment_status: PaymentStatus,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Tender(String),
    FairAwardReceipt(String),
}
