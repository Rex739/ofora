# Ofora Noir circuit test plan

These tests must be executed with the pinned Noir and Barretenberg toolchain
once installed.

Required assertions:

- Nova selected (`selected_supplier_index = 1`) proves successfully.
- Atlas selected (`selected_supplier_index = 0`) fails because Nova is eligible
  and has a higher score.
- Meridian selected (`selected_supplier_index = 2`) fails because delivery days
  exceed the policy maximum.
- Changing policy values invalidates the policy commitment.
- Reusing a proof with a different receipt reference fails.

The current environment does not have `nargo` or `bb`; see
`docs/local-demo.md` for the exact commands that should pass once installed.
