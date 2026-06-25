# UltraHonk Soroban verifier reference lock

Timestamp: 2026-06-25T16:49:00Z

- Repository URL: `https://github.com/indextree/ultrahonk_soroban_contract`
- Local path: `vendor/ultrahonk_soroban_contract`
- Branch: `main`
- Commit SHA: `5c32a280f0b2eaf1563c7096d81d25de8b315572`
- Noir version: `1.0.0-beta.9`
- Barretenberg version: `v0.87.0`
- Stellar CLI version:
  `stellar 27.0.0 (5a7c5fe76530bf4248477ac812fc757146b98cc4)`
- Rust version: `rustc 1.95.0 (59807616e 2026-04-14)`

## Local compatibility patch

Stellar CLI 27 requires `[profile.release] overflow-checks = true` in the
manifest before `stellar contract build --optimize` will run. The vendored
manifest was patched with that build-profile setting only; contract source code
was not modified.
