---
name: commit
description: Stage changes, write a conventional commit message, and commit. Invoke with /commit.
disable-model-invocation: true
allowed-tools: Bash
---

Review the current git state with `git diff` and `git status`. Then:

1. Identify what changed and why (from the diff)
2. Write a commit message following Conventional Commits:
   - `feat:` — new feature
   - `fix:` — bug fix
   - `refactor:` — code change with no behavior change
   - `chore:` — build, config, or tooling
   - `docs:` — documentation only
3. Stage relevant files — never stage `.env` or files with secrets
4. Commit with the message

Subject line must be under 72 characters. Add a body only if the change needs explanation beyond the subject.
