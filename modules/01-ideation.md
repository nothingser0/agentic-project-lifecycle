# Module 01 — Ideation

**When to read this module:** when `classifier_source = new_session` and the idea does not yet have a name or it is not known what to build. If the user can already name one concrete noun (e.g. "expense tracker"), skip directly to planning or build according to the tier.

The purpose of this module: from a hazy spark → a brief that can be directly entered into planning or build, without having to ask again later.

---

## Problem solved

Without grounding, the model will fill gaps with the most statistically common: generic dashboard, "AI-powered X," todo-app-for-Y. This module forces specificity before anything is built.

---

## Step 1 — Find grounding material

Priority order. Use the first available, don't ask all at once:

1. **Something the user already has** — pipeline, dataset, API access, account, existing running infra. Ideas built on something real are always stronger than ideas built on nothing.
2. **Specific pain, not category.** "Slow ideation" is a category. "Every morning I type the same 5 prompts to get content angle" is pain. If user gives category, ask them to tell when it last really bothered them — one sentence.
3. **One specific person.** "Users" is not a person. "I, every morning before content pipeline runs" is a person.
4. **Constraint that eliminates options.** Budget $0, must be self-hosted, there's a tool that's almost perfect but wrong in one thing. Constraint is the fastest way out of the middle of generic.

If none of them → ask **one question** that is most load-bearing (usually #1 or #2). Not an intake form. One question, proceed with whatever comes back.

---

## Step 2 — Three directions, not three variations

Generate three directions that are **genuinely different** — different core loop, different user moment, or different angle on the same pain. Not three versions of the same idea with different colors.

One line per direction: what it is, for whom, why this angle is not the obvious one.

Show to user, ask to choose or redirect. Do not choose yourself. If user explicitly declines ("just do it"), choose the one with strongest grounding, mention why in one line, proceed.

**Skip to one direction** if grounding from Step 1 is already specific enough that the other two directions are only variations.

---

## Step 3 — Detail pass

Fill this template exactly. Every field must be specific to this idea — fields that can be pasted to another idea without edit mean it is not finished yet.

```
## [Idea name — plain, not brand name]

**Pitch:** [one line, use user's vocabulary]

**For:** [one person and one specific moment — not "users"]

**Core loop:** [one thing done repeatedly, that makes the entire product exist. All other features serve this loop]

**Why this and not the obvious version:** [mention the generic version, then what the difference is. Grounding from Step 1 goes here]

**Not building:** [one adjacent thing deliberately excluded]

**Complexity tier:** [Small / Medium / Large / Enterprise — see 00-classifier.md for criteria. Mention 1-2 things that will push it to the next tier]

**First slice:**
- Phase 0 (Foundation): scaffold project, database schema, auth scaffolding, design system tokens, dev environment
- Phase 1 (Core feature): smallest version that proves the core loop end-to-end
- Accept: do [action], see [result]
```

---

## Ideation traps — avoid these

- **"AI-powered X"** as the entire pitch. AI is an implementation detail, not an idea.
- Two trendy words combined without real connection.
- "[Familiar tool] but for [niche]" without any addition besides substitution.
- Feature list that stands as the core loop. If one repeated action cannot be stated in one sentence, this is a list of features looking for a product.
- No first person. "UKM," "creator," "developer" are market segments, not people.
- Value prop through adjectives — "streamlines," "supercharges" — without concrete before/after.
- Scope without edge. If it can expand to everything, it is not scoped yet. The field "Not building" is where this idea is defined, not optional filler.

---

## Output — Brief file

Write the brief to file: `idea-[slug].md`

At the bottom of the brief, add a transition block:

```
## Next

Complexity: [tier from brief]

[If Small]:
→ Ready for BUILD. Bring this brief to the build session:
  - Rule 0: "[Pitch] — Core: [core loop] — Not building: [excluded]"
  - Tier: Small (confirm in 00-classifier.md)
  - Phase 0 Foundation → bootstrap minimum
  - Phase 1 + Accept → first milestone, not rewritten

[If Medium/Large/Enterprise]:
→ Needs PLANNING first. This brief already answers:
  - Pitch → Q0a business case
  - For + Why this → Q0b strategic alignment + persona Phase 1a
  - Tier → scale classifier (do not downgrade)
  - Not building → scope statement Phase 1a
  - First slice Step 0 → milestone M0 in Phase 2a
  - First slice Step 1 + Accept → milestone M1 with acceptance criterion
  Follow the pipeline in SKILL.md to enter planning (brief already exists, skip questions already answered).
```

Deliver as file. Do not just talk in chat.

---

## Module limits

This module stops at the brief. No timeline, no task breakdown, no schema, no deployment plan — all that belongs to the planning or build module.
