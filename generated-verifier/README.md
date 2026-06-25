# Generated Noir UltraHonk Soroban verifier

This directory intentionally does not contain handwritten verifier code.

Ofora must use a generated Noir UltraHonk verifier matching `zk/src/main.nr`.
The current official Stellar ZK docs point to the Noir UltraHonk Soroban
verifier wrapper at:

https://github.com/indextree/ultrahonk_soroban_contract

The expected generation/deployment process is:

1. Install `nargo`, `bb`, `stellar` CLI, Rust `wasm32v1-none`.
2. Compile the Ofora Noir circuit.
3. Generate the verification key with Barretenberg UltraHonk.
4. Deploy the generated/reference verifier contract with that verification key.
5. Configure `ofora-registry` with the deployed verifier contract ID.

Do not replace this with a handwritten verifier or a function that returns
`true`. If verifier generation fails, the real validation flow must fail closed.
