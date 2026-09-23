# AI Model Evaluation, Evaluation Harness & Drift Monitoring Guide

**Purpose:** Standardize machine learning and LLM feature evaluation, regression testing, drift monitoring, and prompt rollback.

**When to use:** Any project integrating LLMs, generative AI features, custom fine-tuned models, or embedding classifiers.

---

## 1. Shift-Left Model Evaluation (Evals as Code)

Never deploy a prompt change or model upgrade based on casual manual testing in a playground. Model behaviors are non-deterministic and can regress silently on edge cases.

### The Golden Evaluation Dataset
Maintain a version-controlled benchmark dataset (`tests/evals/golden-dataset.jsonl`) containing at least 50–100 curated examples representing:
- **Common queries (60%):** Standard user inputs and desired outputs.
- **Edge cases (20%):** Incomplete inputs, unusual formatting, long contexts.
- **Adversarial / Red-team inputs (20%):** Prompt injection, PII extraction attempts, out-of-scope queries.

---

## 2. Automated Regression Harness

Integrate evaluation runs into CI (`gate:qa`):

```typescript
// tests/evals/eval-runner.test.ts
import { test, expect } from 'vitest';
import { runEvaluation } from '@/lib/ai/eval-harness';
import goldenData from './golden-dataset.json';

test('AI Model Accuracy & Safety Regression Floor', async () => {
  const results = await runEvaluation({
    model: process.env.ACTIVE_LLM_MODEL || 'gpt-4o-mini',
    dataset: goldenData,
    judgeModel: 'gpt-4o' // LLM-as-a-judge for semantic quality
  });

  // Strict CI thresholds: PR fails if accuracy drops or safety triggers
  expect(results.semanticAccuracy).toBeGreaterThanOrEqual(0.85); // 85% accuracy floor
  expect(results.safetyViolations).toBe(0);                       // Zero tolerance on security breaches
  expect(results.jsonSchemaValidity).toBe(1.0);                  // 100% structured output validity
});
```

---

## 3. Drift Monitoring in Production

Model providers update hosted weights continuously without changing model names (e.g. OpenAI updating `gpt-4o-mini`). Track these production signals in OpenTelemetry / Sentry:

1. **Schema Parse Failure Rate:** Alert if JSON parsing failure exceeds 0.5% in 15 minutes.
2. **Token Consumption Drift:** Alert if p95 response tokens increase by >30% (indicates looping or verbose hallucination).
3. **Latency p95 Drift:** Alert if time-to-first-token spikes by >2x baseline.
4. **User Negative Feedback:** Track thumbs-down or retry actions in client UI.

---

## 4. Prompt Versioning & Rollback Runbook

Treat prompts with the same rigor as database migrations.

### Pattern: Versioned Prompt Registry
```typescript
// lib/ai/prompts.ts
export const PROMPTS = {
  v1_2: {
    system: "You are a clinical scheduling assistant...",
    temperature: 0.1,
    maxTokens: 500
  },
  v1_3: {
    system: "You are a specialized clinical scheduling assistant...",
    temperature: 0.0,
    maxTokens: 500
  }
} as const;

export const ACTIVE_PROMPT_VERSION = process.env.ACTIVE_PROMPT_VERSION || 'v1_3';
```

### Rollback Procedure:
If a newly deployed prompt triggers hallucinations or user reports in production:
1. Update environment variable in platform dashboard: `ACTIVE_PROMPT_VERSION=v1_2`.
2. Redeploy or trigger zero-downtime container configuration reload.
3. No code rebuild or PR required to revert to last known good prompt.
