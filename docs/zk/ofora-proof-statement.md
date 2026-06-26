# Ofora Proof Statement

Circuit path: `zk/src/main.nr`

The Ofora MVP circuit proves, for exactly three supplier submissions, that the selected supplier:

1. belongs to tender `OFR-2026-041`;
2. is bound to the locked policy commitment;
3. is one of the three public bid commitments;
4. satisfies the minimum quality requirement;
5. satisfies the maximum delivery requirement;
6. has a private integer score greater than or equal to every other eligible supplier;
7. is bound to a unique receipt nonce.

The circuit does not reveal proposed prices, delivery days, quality ratings, local contribution values, or salts as public outputs.

## Public Input Ordering

Each public input is one 32-byte big-endian field:

1. `verification_context_commitment`

The verification context commitment folds the previously public validation context
into one Poseidon2 field:

1. domain separator `3001`
2. selected supplier index
3. tender reference
4. receipt nonce
5. policy version
6. expected policy commitment
7. bid commitments `[0..2]`
8. selected bid commitment

Current local Nova proof public inputs:

```text
1dccbabec5a97e182c21e48b3fc38caa802e922527aff2b9f1d9d5781ff85f15
```

## Local Evidence

`scripts/zk/test-ofora-award-proof.sh` currently verifies:

- Ofora Noir circuit compiles.
- Nova witness solves.
- Nova UltraHonk proof verifies locally with `bb`.
- Atlas witness fails the winner constraint.
- Meridian witness fails the eligibility constraint.
