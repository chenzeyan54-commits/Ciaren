# FlowFrame — Claude Code Instructions

This file currently carries only the shared engineering workflow. Add this
project's stack, commands, architecture, and gotchas as they are established.

## Autonomous engineering workflow

For multi-step, unattended, high-risk, or mockup-driven implementation, invoke
`/autonomous-run` and follow its companion-skill graph.

- Build atomic acceptance criteria with `/acceptance-contract` before code changes.
- Use `/verification-loop` for every material behavior change.
- Use `/visual-fidelity` for every mockup, screenshot, Figma, responsive, or UI-state requirement.
- Use `/security-domain-review` for auth, payments, permissions, tenancy, secrets,
  entitlements, sensitive data, webhooks, or destructive migrations.
- The implementer cannot be the sole reviewer.
- No evidence means not complete.
- Record long-run state in `docs/agent-runs/` (templates in `docs/agent-runs/_templates/`).

These five skills are installed at user scope and are available in every repository.

### Precedence with this repository's own skills

The global skills supply the *method* (acceptance IDs, evidence gates, independent
review, finding IDs). This repository's local skills supply the *rules*. Where the
two disagree on a repo-specific rule, the local skill wins; the global gate still
has to be satisfied.

- `add-node` is unaffected and keeps its existing trigger.
