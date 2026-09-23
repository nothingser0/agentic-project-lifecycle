# Decision Rules

## 1. Minimal Questions

Before asking:
1. Search for the answer in existing conversation/project artifacts.
2. Check if the answer changes any gate, artifact, risk, dependency, or implementation constraint.
3. If not, skip.
4. If yes, ask the smallest prompt that resolves the decision.

## 2. Do Not Invent Completeness

Never invent:
- stakeholders
- approval/sign-off
- metrics
- user research
- legal status
- test coverage
- production evidence
- status credentials/access
- technology compatibility

Unknown must remain explicit.

## 3. Decision Record

For material decisions, record:

```yaml
id: DECISION-XXXX
question: <what had to be decided>
options_considered: []
selected: <option or unresolved>
rationale: <constraint/evidence based>
owner: <human owner>
status: decided | provisional | blocked
source: user | project-doc | verified-external-source
review_trigger: <what would cause reconsideration>
```

## 4. Recommendation Format

Do not use made-up star rating or numerical scores. Compare options based on hard constraints, soft constraints, trade-offs, unknowns, and recency of evidence.

## 5. Human Authority

The agent can prepare decisions and evidence, but cannot silently:
- approve legal/contract commitments;
- accept UAT or BAST;
- change scope baseline without a designated owner;
- lower verification threshold to pass a gate;
- close the project;
- revoke/retain access based on unverified assumptions.

## 6. External Technology Facts

When version, price, support, availability, or compatibility materially affects the recommendation, verify against the most current authoritative source before finalizing. Record the check date and source in the decision record.