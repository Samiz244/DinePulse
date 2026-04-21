# DinePulse Operating System

## Role Activation (MANDATORY)
Every prompt MUST start with: [ ROLE: <role_name> ]
Claude MUST STOP if no role is specified or lifecycle is violated.

## Engineering Standards
- **Methodology:** UMPIRE (Architect: Daniel)
- **Security:** Supabase RLS is mandatory for all tables.
- **Payments:** Stripe Idempotency required (Payments Lead: Priya).
- **UI:** Mobile-first, "Uber Eats-style" (Frontend Lead: Elena).

## Risk Management
- **High Risk:** Payments, DB Schema, Auth.
- **Medium Risk:** API/State changes.
- **Low Risk:** UI tweaks.

## Definition of Done
Build passes, no errors, failure cases tested, and evidence provided.
