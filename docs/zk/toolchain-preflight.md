# Ofora ZK toolchain preflight

Timestamp: 2026-06-25T16:37:32Z

## Host

- OS: macOS 26.5.1 (25F80)
- Kernel family: Darwin
- Architecture: arm64
- Xcode developer path: `/Applications/Xcode.app/Contents/Developer`
- Available disk on project volume: 12 GiB free of 460 GiB
- Memory observation: `vm_stat` available; compressed memory and swap are active

## Existing tools

- Git: `git version 2.50.1 (Apple Git-155)`
- curl: `curl 7.87.0 (arm64-apple-darwin20.0.0)`
- Homebrew: `Homebrew 6.0.3`
- rustc: `rustc 1.95.0 (59807616e 2026-04-14)`
- cargo: `cargo 1.95.0 (f2d3ce0bd 2026-03-21)`
- rustup: `rustup 1.29.0 (28d1352db 2026-03-05)`
- Node.js: `v22.5.1`
- npm: `10.8.2`

## Missing tools before Phase 0 install

- `nargo`
- `bb`
- `stellar`

`soroban` is intentionally not required; current Stellar tooling uses the
`stellar` command.

## Blockers

- No Xcode Command Line Tools blocker found.
- Disk space is tight at approximately 12 GiB free; large downloads or optimized
  contract builds may need cleanup if they fail due to storage.
