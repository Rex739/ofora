# DoraHacks Submission Draft

## Project name

Ofora

## Tagline

Confidential bids. Defensible awards.

## One-sentence pitch

Ofora lets organizations keep supplier bids confidential while proving that every contract award followed rules locked before submissions began.

## Problem

Procurement teams need public trust, but publishing supplier bid details can expose sensitive commercial information and weaken future competition.

## Solution

Ofora locks tender rules before supplier submissions, evaluates protected proposals, and publishes a defensible award record without revealing competing bid values or internal scores.

## How ZK is used

Ofora uses a Groth16 proof to show that Nova Relief Systems was eligible and scored at least as highly as every other eligible supplier under the locked tender rules. The public proof input is a verification context commitment; private bid values, salts, and witness data remain protected.

## Why Stellar

Soroban lets Ofora verify the Groth16 proof on Stellar testnet, store a verification receipt, and require the registry to consume that receipt before finalizing the award record. This gives auditors a public trail without exposing confidential submissions.

## Achievements

- Deployed Groth16 verifier receipt contract: `CDGHNWSNU43NOBSH7PBOJ7F25LJ66UXPZKL6I3C6PXCP6JBZHH4JFS4E`
- Deployed Ofora registry contract: `CACEBZHKO5ONJSBFY372FOZQADRKNR23JXFYG7KQOAMGYZPN7ISCHDRS`
- Verification receipt transaction: `6daf9e1a7d2b4d237771352be4c392bb0febc3d72ddd3de375ef8693199d33f2`
- Registry finalization transaction: `e95f7d95fa716c24f4123f87c57ab478f3db1ffa92dcfa2ffaf4e1a1dbde527e`
- Fair Award Receipt: `FAR-OFR-2026-041-NOVA`
- Atlas rejection and Meridian ineligibility covered by regression tests.

## Limitations

- Hackathon MVP.
- Development-grade Groth16 trusted setup.
- Browser-local state remains in prototype demo areas.
- Escrow and payment release are not implemented.
- Production identity, access control, secure submission storage, and procurement-system integrations remain future work.

## Repository link

Placeholder.

## Demo link

Placeholder.
