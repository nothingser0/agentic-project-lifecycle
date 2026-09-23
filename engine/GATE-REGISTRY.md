# Gate Registry

Gates are state transitions, not checklists. Gate status: **PASS**, **BLOCKED**, or **ADVISORY**.
The agent must record evidence behind the status.

| Gate | Entry | Pass condition | Block action |
|------|-------|----------------|--------------|
| Gate 0 | Phase 0 | Business case + accountable sponsor/owner identified | Stay in Phase 0; record missing authority/evidence |
| Gate 1 | Q0e | Client legal/contract status is explicit; signed when required before development | Record legal blocker; do not silently mark cleared |
| Gate 2 | Q0f | Charter approval state is explicit; kick-off can be scheduled safely; **`docs/pm/RACI.md` exists and has no empty role columns for active roles** (Medium+ — per Cross-phase rule 21); solo projects: `docs/pm/STAKEHOLDERS.md` paragraph written instead | Keep charter draft/review status visible; block kick-off if RACI has unfilled columns |
| Gate R | Phase 1a | Scope, requirements, acceptance/verification approach, traceability and sign-off state are recorded | Return to requirements; no downstream baseline claim |
| Gate T | Phase 2a | Schedule model, milestones, dependencies, baseline and deviation rules exist | Stay in timeline phase; no “on track” claim without baseline |
| Gate D | Phase 6 | Tier 0, required contracts, ownership and verification path exist | Development start is blocked for agentic workflows |
| Gate C | Phase 7 | Release/UAT evidence, closure package, handover/access state and retrospective are complete per formality | Remain open; return to development if release evidence is missing |

## Non-negotiable Rules

1. A gate cannot pass merely because the artifact exists — the required evidence must be filled.
2. The agent cannot approve its own failed gate.
3. Human approval remains with the human even if the agent prepares the document.
4. If a gate is blocked, downstream artifacts may be drafted but must be marked `DRAFT`/`BLOCKED`.
5. **Gate D (development start) for Medium+ projects requires test-coverage evidence, not just a passing suite.** A CI coverage report meeting `references/qa/TESTING_STRATEGY_DETAIL.md`'s 80%+ target (100% on payment/auth) must be attached as evidence, same as the security-scan and Lighthouse evidence already required — see `SKILL.md` Cross-phase rule 9.
6. **If `docs/security/COMPLIANCE.md` names an actual regime** (GDPR/CCPA/HIPAA/PCI-DSS/SOC 2/ISO 27001/FedRAMP), **Gate C (closure) cannot pass on agent-prepared compliance content alone.** The agent may draft `COMPLIANCE.md`, but a human with compliance/legal authority must sign off before closure evidence counts as complete — record the signer under `legal_reviewed_by` in CONTEXT.md (see `engine/PROJECT-PROFILE.md` closure-evidence table). This mirrors Rule 3 above; it is called out explicitly here because compliance sign-off is easy to mistake for a document-completeness check rather than a human-authority check.
7. **For Large and Enterprise projects, Gate D (development start) requires `docs/pm/BUDGET.md` baseline approved.** Build cannot commence with undefined or unallocated financial resources.
8. **For projects exposing public or cross-team APIs, production deployment requires OpenAPI documentation (`OPENAPI.json` / `references/docs/API_DOCUMENTATION_GUIDE.md`) and verified consumer contract tests (`references/qa/CONTRACT_TESTING_GUIDE.md`).**