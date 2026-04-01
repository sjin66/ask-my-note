---
name: review
description: Run the code-reviewer agent on current uncommitted changes. Invoke with /review.
disable-model-invocation: true
allowed-tools: Bash
---

Use the code-reviewer agent to review all uncommitted changes in this repository.

Run `git diff` and `git diff --staged` first to get the full picture of what has changed, then pass the results to the code-reviewer agent for a thorough review.
