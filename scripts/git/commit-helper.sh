#!/usr/bin/env bash

set -euo pipefail

# Ofora conventional commit helper.
types=("feat" "fix" "docs" "style" "refactor" "perf" "test" "chore" "ci" "build")
scopes=(
  "workspace"
  "landing"
  "dashboard"
  "tenders"
  "supplier"
  "evaluation"
  "awards"
  "audit"
  "zk"
  "stellar"
  "contracts"
  "escrow"
  "ui"
  "state"
  "config"
  "deps"
  "types"
  "docs"
  "tooling"
)

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: this helper must be run inside a git repository."
  exit 1
fi

if git diff --cached --quiet; then
  echo "No staged changes found."
  echo "Stage files first, then run this helper again."
  exit 1
fi

echo "Select commit type:"
select type in "${types[@]}"; do
  if [[ -n "${type:-}" ]]; then
    break
  fi
  echo "Invalid selection. Try again."
done

echo "Select commit scope:"
select scope in "${scopes[@]}" "custom"; do
  if [[ "${scope:-}" == "custom" ]]; then
    read -r -p "Enter custom scope: " custom_scope
    if [[ -z "$custom_scope" ]]; then
      echo "Scope cannot be empty."
      continue
    fi
    scope="$custom_scope"
    break
  elif [[ -n "${scope:-}" ]]; then
    break
  fi
  echo "Invalid selection. Try again."
done

read -r -p "Enter a short commit message: " message
if [[ -z "$message" ]]; then
  echo "Commit message cannot be empty."
  exit 1
fi

read -r -p "Enter a detailed description (optional, press Enter to skip): " details
read -r -p "Reference an issue (optional, e.g. #123): " issue
read -r -p "Do you want to edit the commit message before committing? (y/n): " edit_choice

commit_msg="$type($scope): $message"

if [[ -n "$details" ]]; then
  commit_msg+=$'\n\n'"$details"
fi

if [[ -n "$issue" ]]; then
  commit_msg+=$'\n\n'"Closes $issue"
fi

if [[ "$edit_choice" =~ ^[Yy]$ ]]; then
  commit_file="$(mktemp)"
  trap 'rm -f "$commit_file"' EXIT
  printf '%s\n' "$commit_msg" > "$commit_file"
  git commit --edit -F "$commit_file"
else
  git commit -m "$commit_msg"
fi

echo
echo "Commit created successfully."
