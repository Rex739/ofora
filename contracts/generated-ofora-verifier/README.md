# Generated Ofora verifier wrapper

This contract wraps the UltraHonk verifier interface for the Ofora award-validation circuit in `zk/src/main.nr`.

The verification key is supplied at deployment time from:

```bash
artifacts/ofora-zk-demo/nova-proof/vk
```

The verifier expects Barretenberg UltraHonk artifacts generated with:

```bash
bb prove --scheme ultra_honk --oracle_hash keccak --output_format bytes_and_fields
bb write_vk --scheme ultra_honk --oracle_hash keccak --output_format bytes_and_fields
```

Public input ordering:

1. `selected_supplier_index`
2. `tender_ref`
3. `receipt_nonce`
4. `policy_version`
5. `expected_policy_commitment`
6. `bid_commitments[0]`
7. `bid_commitments[1]`
8. `bid_commitments[2]`
9. `selected_bid_commitment`

