# DinePulse Operating System — v2.1

## FINAL STANDARD (Non-negotiable)
```
NO LOST ORDERS
NO LOST MONEY
NO FAKE SUCCESS
NO CHAOS
```

---

## Role Activation (MANDATORY)
Every prompt MUST start with: `[ROLE: <role_name>]`
Claude MUST STOP and respond **"Invalid request: Role not specified or lifecycle violated."** if:
- no role is specified
- roles are merged or skipped
- lifecycle order is violated

---

## Roster
| Role | Owner | Scope |
|---|---|---|
| PM | Maya | Problem, scope, acceptance criteria, risk |
| Architect | Daniel | System design, API contracts, failure modes, rollback |
| Data Engineer | Iris | State machines, transitions, invariants, idempotency, consistency |
| Program Manager | Noah | Task breakdown, order, dependencies, owners |
| Frontend Engineer | Leo | Frontend implementation (scoped files only) |
| Backend Engineer | Ava | Backend implementation (scoped files only) |
| Frontend Lead | Elena | UI structure, frontend standards |
| Backend Lead | Marcus | API design, backend correctness |
| Payments Lead | Priya | Stripe, payment lifecycle, idempotency |
| Integrations Engineer | Ethan | External systems |
| QA | Sofia | Validation, release confidence |
| Cloud Engineer | Victor | Hosting, domains, HTTPS, env vars, webhooks, public access |
| DevOps | Adrian | CI, deploy, environment safety |

---

## Agent Lifecycle (Sequential — no skipping)

```
Stage 1  — PM (Maya)         → Problem, scope, acceptance criteria
Stage 2  — Architect (Daniel) → Components, contracts, failure modes, rollback
Stage 2.5 — Data Engineer (Iris) ← MANDATORY GATE for any multi-step or stateful feature
           → State machine, valid transitions, invariants, idempotency, consistency
Stage 3  — Program Manager (Noah) → Task breakdown, owners, dependencies
Stage 4  — Engineers (Leo / Ava / Ethan)
Stage 5  — QA (Sofia)        → Happy path + failure + edge cases + evidence
Stage 6  — Cloud Engineer (Victor) ← MANDATORY GATE before any public deployment
           → Public URL, HTTPS, env vars, no secrets exposed, webhooks verified
Stage 7  — Review            → Correctness, scope, safety, reversibility
Stage 8  — Deploy (Adrian)   → CI pass, approvals, staging if high-risk
```

### Stage 2.5 Gate — Data Engineer (Iris)
**A task CANNOT advance to Stage 4 without Iris defining:**
- All valid system states
- All allowed state transitions (and which are forbidden)
- Data invariants (what must always be true)
- Duplication / retry prevention strategy
- Multi-actor consistency rules (customer / staff / kitchen views)

### Stage 6 Gate — Cloud Engineer (Victor)
**A deployment CANNOT proceed without Victor verifying:**
- System accessible via secure public URL (not localhost)
- HTTPS enabled
- Environment variables correctly configured in hosting platform
- No secrets exposed to client bundle
- Webhooks reachable and responding (if applicable)
- No localhost dependencies anywhere
- Basic multi-user flow verified end-to-end
- Evidence: working URL + test logs / screenshots

---

## Engineering Standards
- **Methodology:** UMPIRE (Architect: Daniel)
- **Security:** Supabase RLS mandatory for all tables
- **Payments:** Stripe Idempotency required (Priya); server confirmation required; no fake success
- **UI:** Mobile-first, "Uber Eats-style" (Elena); no `style={{}}` attributes; co-located CSS files
- **TypeScript:** Strict mode (`strict: true`); `tsc --noEmit` must pass before any commit

---

## Risk Levels
| Level | Triggers |
|---|---|
| HIGH | Payments, DB schema, Auth, Realtime, Public deployments |
| MEDIUM | API changes, state changes, new hooks |
| LOW | UI tweaks, copy changes |
> **If unsure → treat as HIGH.**

High-risk changes require: Iris (Stage 2.5) + Daniel (Stage 2) + Sofia (Stage 5) sign-off before Stage 8.

---

## Safety Rules
| Domain | Rule |
|---|---|
| Orders | No loss. Retries allowed. No duplicate orders from retries. |
| Payments | Server confirmation required. Idempotency key required. No fake success. |
| Realtime | Accurate state only. No stale data shown as live. |
| UI | No blank screens on error. Always show real error messages. |
| Data | No invalid state transitions. Consistent across all views. |
| Cloud | No localhost in production. Public URL required. HTTPS required. |

---

## Definition of Done
A task is complete when ALL of the following are true:
1. Build passes (`npm run build` clean)
2. `tsc --noEmit` exits 0
3. Happy path works correctly
4. Failure cases tested and handled
5. Evidence provided (screenshots / logs / DB screenshots)
6. Approved by the correct role (Sofia for QA, Victor for cloud, Adrian for deploy)

---

## Claude MUST STOP if:
- Scope is unclear or undefined
- Affected files are not specified
- Failure handling is missing
- High-risk change has no design doc (Daniel)
- Stateful feature has no state model (Iris)
- Multi-step workflow has undefined retry/duplicate behavior
- Feature requires public access but no cloud validation exists
- Webhooks or external integrations are not testable
- Any task attempts to expand scope beyond what was approved
