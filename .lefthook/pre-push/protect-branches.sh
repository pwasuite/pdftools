#!/usr/bin/env bash
#
# pre-push hook: protect branches from force pushes and direct pushes.
#
# Two independent layers:
#   1. Force push protection  — blocks non-fast-forward pushes (always on)
#   2. Direct push protection — blocks all pushes to protected branches (on by default)
#
# Bypass env vars (independent):
#   FORCE_PUSH_ALLOWED=1  — allow force pushes (implies direct push allowed too)
#   DIRECT_PUSH_ALLOWED=1 — allow normal pushes to protected branches
#   LEFTHOOK=0            — skip all lefthook hooks (built-in)

set -euo pipefail

# --- Configuration -----------------------------------------------------------

PROTECTED_BRANCHES=(main master)

# --- Bypass checks -----------------------------------------------------------

force_push_allowed=false
direct_push_allowed=false

if [[ "${FORCE_PUSH_ALLOWED:-}" == "1" ]]; then
  force_push_allowed=true
  direct_push_allowed=true  # force push bypass implies direct push bypass
fi

if [[ "${DIRECT_PUSH_ALLOWED:-}" == "1" ]]; then
  direct_push_allowed=true
fi

# --- Helpers ------------------------------------------------------------------

ZERO_SHA="0000000000000000000000000000000000000000"

is_protected() {
  local branch="$1"
  for protected in "${PROTECTED_BRANCHES[@]}"; do
    if [[ "$branch" == "$protected" ]]; then
      return 0
    fi
  done
  return 1
}

is_force_push() {
  local local_sha="$1"
  local remote_sha="$2"

  # New branch or deleted branch — not a force push
  if [[ "$remote_sha" == "$ZERO_SHA" ]] || [[ "$local_sha" == "$ZERO_SHA" ]]; then
    return 1
  fi

  # If remote_sha is ancestor of local_sha, it's a fast-forward (not force push)
  if git merge-base --is-ancestor "$remote_sha" "$local_sha" 2>/dev/null; then
    return 1
  fi

  return 0
}

extract_branch() {
  local ref="$1"
  echo "${ref#refs/heads/}"
}

# --- Main loop ----------------------------------------------------------------

blocked=false

while read -r local_ref local_sha remote_ref remote_sha; do
  # Skip branch deletions
  if [[ "$local_sha" == "$ZERO_SHA" ]]; then
    continue
  fi

  branch=$(extract_branch "$remote_ref")

  if is_protected "$branch"; then
    # Layer 2: Direct push protection
    if [[ "$direct_push_allowed" == "false" ]]; then
      echo "BLOCKED: Direct push to protected branch '$branch' is not allowed."
      echo "  Use a pull request instead."
      echo "  To bypass: DIRECT_PUSH_ALLOWED=1 git push ..."
      echo ""
      blocked=true
      continue
    fi

    # Layer 1: Force push protection (even if direct push is allowed)
    if [[ "$force_push_allowed" == "false" ]] && is_force_push "$local_sha" "$remote_sha"; then
      echo "BLOCKED: Force push to protected branch '$branch' is not allowed."
      echo "  To bypass: FORCE_PUSH_ALLOWED=1 git push ..."
      echo ""
      blocked=true
      continue
    fi
  else
    # Non-protected branch: still block force pushes
    if [[ "$force_push_allowed" == "false" ]] && is_force_push "$local_sha" "$remote_sha"; then
      echo "BLOCKED: Force push to branch '$branch' is not allowed."
      echo "  To bypass: FORCE_PUSH_ALLOWED=1 git push ..."
      echo ""
      blocked=true
      continue
    fi
  fi
done

if [[ "$blocked" == "true" ]]; then
  exit 1
fi
