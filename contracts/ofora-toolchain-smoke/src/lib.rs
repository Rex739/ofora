#![no_std]

use soroban_sdk::{contract, contractimpl};

#[contract]
pub struct OforaToolchainSmoke;

#[contractimpl]
impl OforaToolchainSmoke {
    pub fn ping() -> u32 {
        42
    }
}

#[cfg(test)]
mod tests {
    extern crate std;

    use super::{OforaToolchainSmoke, OforaToolchainSmokeClient};
    use soroban_sdk::Env;

    #[test]
    fn ping_returns_42() {
        let env = Env::default();
        let contract_id = env.register(OforaToolchainSmoke, ());
        let client = OforaToolchainSmokeClient::new(&env, &contract_id);

        assert_eq!(client.ping(), 42);
    }
}
