# Ofora Commitment Specification

Commitments use Poseidon2 over BN254 scalar fields.

No SHA placeholder or arithmetic checksum is used in the circuit.

## Encoding

- Numeric values are field elements.
- Public input files use 32-byte big-endian field encoding.
- Tender reference `OFR-2026-041` is encoded as field `2026041`.
- Policy version `1.0` is encoded as field `1`.
- Supplier references are encoded as:
  - Atlas: `1`
  - Nova: `2`
  - Meridian: `3`
- Salts are private field elements generated into ignored local witness artifacts.

## Policy Commitment

Field order:

1. domain separator `1001`
2. tender reference
3. price weight
4. delivery weight
5. stock weight
6. quality weight
7. local weight
8. minimum quality
9. maximum delivery days
10. budget ceiling
11. policy version

The commitment is a left-folded Poseidon2 hash:

```text
cur = Poseidon2(1001, tender_ref)
cur = Poseidon2(cur, price_weight)
...
policy_commitment = Poseidon2(cur, policy_version)
```

## Bid Commitment

Field order:

1. domain separator `2001`
2. tender reference
3. supplier reference
4. proposed price
5. delivery days
6. stock availability
7. quality rating
8. local contribution
9. private supplier salt

The commitment is a left-folded Poseidon2 hash with the same two-field hash primitive.

## Verification Context Commitment

Field order:

1. domain separator `3001`
2. selected supplier index
3. tender reference
4. receipt nonce
5. policy version
6. expected policy commitment
7. bid commitment 0
8. bid commitment 1
9. bid commitment 2
10. selected bid commitment

The commitment is the single public input to the compressed Ofora proof. The
individual context values remain available to the registry and public artifacts,
but they are no longer separate verifier public inputs.

## Implementations

- Circuit: `zk/src/main.nr`
- Off-chain public/witness generator: `scripts/zk/commitment-tool/`
- Registry comparison: `contracts/ofora-registry/src/lib.rs`
