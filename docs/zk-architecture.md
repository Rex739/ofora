# Ofora ZK architecture

## Current status

This repository now contains the technical workspace for the real proof-backed
validation flow, but this environment is missing the required proof and Stellar
tools:

- `nargo`: not installed
- `bb`: not installed
- `stellar`: not installed
- `soroban`: not installed

Because of that, no generated proof, generated UltraHonk verifier, testnet
contract ID, or transaction hash is claimed in this repository state.

## Public data

The public verification surface is intentionally small:

- Tender reference
- Locked policy commitment
- Three bid commitments
- Selected bid commitment
- Selected supplier index
- Policy version
- Receipt reference
- Verifier public inputs
- Registry validation metadata

## Private data

These values remain private witness data and must not be written to public
artifacts, contract state, or public frontend responses:

- Proposed price
- Delivery time
- Stock availability
- Quality rating
- Local contribution
- Supplier salts
- Internal supplier references where not needed publicly
- Supporting document metadata

## Commitment model

The target commitment model is Poseidon2 over field elements with this exact
field order.

Policy commitment:

1. tender reference
2. price weight
3. delivery weight
4. stock weight
5. quality weight
6. local contribution weight
7. minimum quality
8. maximum delivery days
9. budget ceiling
10. policy version

Bid commitment:

1. tender reference
2. supplier reference
3. proposed price
4. delivery days
5. stock availability
6. quality rating
7. local contribution
8. supplier salt

`scripts/zk/generate-commitments.ts` currently writes SHA-256 helper metadata
only so non-sensitive artifact plumbing can be tested. Those helper hashes are
not the final ZK commitments and are labeled as such in the output.

## Circuit statement

`zk/src/main.nr` proves:

1. Private policy values produce the public policy commitment.
2. Three private bid records produce the three public bid commitments.
3. Every bid belongs to the current tender reference.
4. Eligibility is checked with quality, delivery, and budget requirements.
5. The selected supplier is eligible.
6. The selected supplier commitment matches the selected public commitment.
7. The selected supplier score is greater than or equal to every other eligible
   supplier score.
8. The proof is bound to the receipt reference to prevent replay against another
   receipt.

## Scoring formula

The circuit uses integer-only weighted scoring:

```text
price_component = ((budget_ceiling - price) * 100) / budget_ceiling
delivery_component = ((maximum_delivery_days - delivery_days) * 100) / maximum_delivery_days
stock_component = stock_availability
quality_component = quality_rating
local_component = local_contribution

score =
  price_component * price_weight +
  delivery_component * delivery_weight +
  stock_component * stock_weight +
  quality_component * quality_weight +
  local_component * local_weight
```

The score is not public. The only public result is whether the selected
commitment verified.

For the MVP data, the ranking outcome remains:

- Nova Relief Systems is eligible and highest-ranked.
- Atlas Supply Group is eligible but not highest-ranked.
- Meridian Industrial Ltd. is not eligible because delivery is 18 days.

## Soroban registry

`contracts/ofora-registry` stores:

- tender ID
- admin address
- policy commitment
- policy version
- lifecycle status
- submission deadline
- bid commitments
- selected winning commitment after validation
- receipt ID after validation
- validation timestamp
- payment readiness status
- generated verifier contract address

It does not store private bid values.

## Generated verifier

The registry calls a separate generated verifier contract. The official Stellar
ZK documentation references the Noir UltraHonk Soroban verifier wrapper:

https://github.com/indextree/ultrahonk_soroban_contract

The generated verifier must be built from the actual Ofora Noir circuit
verification key. A handwritten verifier or hard-coded `true` response is not
acceptable.

## Why each supplier behaves differently

- Atlas fails validation because it is eligible but another eligible supplier
  has a higher score.
- Meridian fails because it does not satisfy the delivery deadline requirement.
- Nova succeeds because it is eligible and scores at least as high as every
  other eligible submission.

## MVP limitations

- Exactly one tender format
- Exactly three bid commitments
- Integer-only values
- One selected candidate per proof
- One policy version
- No mainnet deployment
- No asset custody or payment transfer

## Production requirements

Production scale would require a final Poseidon2 commitment implementation
shared between Noir/off-chain generation/Soroban, audited circuit constraints,
identity and authorization design, larger bid sets, key management, artifact
retention policy, and operational monitoring for proof generation and testnet or
mainnet submission.
