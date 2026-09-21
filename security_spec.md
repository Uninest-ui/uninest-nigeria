# Security Specification for UniNest Firestore

## 1. Data Invariants
1. A user document in `/users/{userId}` must correspond to a valid identifier string (`isValidId(userId)`).
2. Users can create and read user profiles, but cannot arbitrarily tamper with or escalate admin privileges.
3. Creation of user profiles requires mandatory fields (`id`, `email`, `name`, `role`).
4. Timestamps and string fields must satisfy bounded volumetric length constraints (`maxLength` limits) to prevent Denial of Wallet attacks.

## 2. The Dirty Dozen Payloads
1. **Payload 1 (ID Poisoning Attack)**: Document ID containing illegal URI or path traversal characters: `/users/../../system_config` -> Rejected by `isValidId`.
2. **Payload 2 (Denial of Wallet Mega String)**: A user document with `name` exceeding 100 characters (e.g. 5,000 characters) -> Rejected by length guard.
3. **Payload 3 (Admin Privilege Escalation via Signup)**: An unauthenticated or standard student user attempting to set `role: "admin"` directly in public signup -> Rejected.
4. **Payload 4 (Missing Required Fields)**: A user signup missing `email` or `name` -> Rejected by strict schema check.
5. **Payload 5 (Identity Spoofing on User Document)**: User attempting to overwrite another user's document ID with different owner credentials -> Rejected.
6. **Payload 6 (Shadow Field Injection)**: An attacker submitting extra undeclared fields like `{ isSuperAdmin: true }` -> Rejected by strict schema validation.
7. **Payload 7 (Invalid Role Enum)**: Submitting `{ role: "superuser" }` -> Rejected by enum validation.
8. **Payload 8 (PII Harvesting via Blanket Queries)**: An unauthenticated visitor attempting to query all documents without permission -> Rejected.
9. **Payload 9 (Oversized Phone String)**: Injecting 2,000 bytes into the `phone` field -> Rejected by string size constraint.
10. **Payload 10 (Type Poisoning on Verified Flag)**: Submitting `{ verified: "true" }` (string instead of boolean) -> Rejected by type check.
11. **Payload 11 (Empty User ID)**: Submitting `{ id: "" }` with zero length -> Rejected by ID boundary validator.
12. **Payload 12 (Invalid Level Length)**: Submitting `{ level: "100L" + "A".repeat(200) }` -> Rejected by size check.

## 3. Test Runner
All payloads have been audited against the rules logic to ensure malicious writes and unauthorized access return `PERMISSION_DENIED`.
