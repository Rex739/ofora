# Ofora Groth16 Feasibility Spike

This workspace is isolated from the existing Noir/UltraHonk proof path.

The spike targets the official Stellar `groth16_verifier` example shape: Circom
2.2.1, Groth16, and BLS12-381 public signals.

Important limitation: this circuit uses a BLS12-381 arithmetic field-fold
commitment so it can be verified through Stellar's BLS12-381 host functions. It
does not replace the existing Ofora Poseidon2/BN254 commitment path.

