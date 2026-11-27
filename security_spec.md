# Security Specification for UniNestNigeria Firestore

## 1. Data Invariants
1. **Identity & Authentication Integrity**: Every write operation (`create`, `update`, `delete`) requires an authenticated Firebase user with `request.auth.token.email_verified == true`. Author/buyer/submitter UID fields in incoming payloads must strictly match `request.auth.uid`.
2. **Responsible-Admin Payment Confirmation Gate**: All customer orders (`/orders`), Top Vendor boost requests (`/featured_requests`), Helper contact unlocks (`/helper_unlocks`), and Scout unlocks/bookings (`/scout_unlocks`, `/scout_bookings`) MUST be created in status `'pending_confirmation'`. Non-admins cannot self-confirm payments, self-credit wallet balances, or self-activate featured placement.
3. **PII Isolation (Split Collection Strategy)**:
   - Public catalogs (`/vendors`, `/products`, `/project_helpers`, `/scouts`, and `/reviews`) store zero unmasked phone numbers, personal emails, residential addresses, or credentials.
   - Helper and Scout direct contact details live in `/project_helpers/{helperId}/private/contact` and `/scouts/{scoutId}/private/contact`, readable ONLY by admins, the profile owner, or a verified student whose deterministic unlock record (`${uid}__${entityId}`) has been marked `'confirmed'` by the responsible admin.
   - PII-bearing collections (`/orders`, `/withdrawals`, `/helper_unlocks`, `/scout_unlocks`, `/scout_bookings`, `/service_submissions`) restrict `get` and `list` strictly to document owners (`buyerUid`/`requesterUid`/`studentUid`/`fresherUid`/`submitterUid == request.auth.uid`) or verified admins (`amaechihellis@gmail.com` or `/admins/{uid}`).
4. **Immutable Ownership & Strict Server Timestamps**: Creation timestamps (`createdAt == request.time`) and update timestamps (`updatedAt == request.time`) are validated against `request.time`. Owner UIDs, parent foreign keys (`vendorId`, `helperId`, `scoutId`), and financial amounts on submitted payment records cannot be altered after creation.
5. **Path Hardening & Bounded Payloads**: Every single-document ID variable enforces `isValidId()` (`^[a-zA-Z0-9_\\-]+$`, max 128 chars). Every string field enforces `.size()` limits synchronized with `firebase-blueprint.json`, preventing Denial-of-Wallet mega-string attacks.
6. **Terminal State Locking**: Once orders, withdrawals, unlock requests, featured boosts, or bookings transition to `'confirmed'`, `'approved'`, `'rejected'`, or `'completed'`, non-admin modifications are permanently blocked.

## 2. The Dirty Dozen Payloads
1. **ID Poisoning Attack**: Attempt to create `/orders/..%2F..%2Fadmins` -> Rejected by `isValidId(orderId)`.
2. **Self-Confirmation Fraud on Order Create**: Student creates `/orders/ord-fraud-1` with `{ paymentStatus: "confirmed", buyerUid: uid }` -> Rejected because `isValidOrderCreate()` requires `paymentStatus == "pending_confirmation"`.
3. **Helper Paywall Bypass (Reading Private Contact Before Confirmation)**: Authenticated student reads `/project_helpers/helper-1/private/contact` with `helper_unlocks/{uid}__helper-1` still `'pending_confirmation'` -> Rejected because rule checks `status == 'confirmed'`.
4. **Identity Spoofing on Order / Unlock Create**: Authenticated user creates an order with `{ buyerUid: "victim_uid_999" }` -> Rejected because `incoming().buyerUid == request.auth.uid` is strictly enforced.
5. **Shadow / Ghost Field Injection**: User submits `/orders/ord-shadow` containing all required fields plus `{ isAdminOverride: true }` -> Rejected by `incoming().keys().hasOnly([...])`.
6. **Privilege Escalation on Admin Registry**: Non-admin user attempts to write `/admins/{uid}` -> Rejected because `/admins` allows writes only for `isSuperAdmin()` or existing verified `/admins`.
7. **Unverified Email Spoofing Attack**: User token has `email == "amaechihellis@gmail.com"` but `email_verified == false` -> Rejected by explicit `request.auth.token.email_verified == true` check.
8. **Blanket Query PII Harvesting**: Non-admin authenticated user calls `getDocs(collection(db, "orders"))` without `.where("buyerUid", "==", auth.currentUser.uid)` -> Rejected by `allow list` evaluating `resource.data.buyerUid == request.auth.uid`.
9. **Terminal State Mutation Attack**: Student tries to update a `'rejected'` unlock document back to `'pending_confirmation'` or `'confirmed'` -> Rejected by `update` action rules & terminal state guard.
10. **Denial-of-Wallet Mega String**: Reviewer submits a 5,000-character review text on `/project_helpers/helper-1/reviews/rev-huge` -> Rejected by `text.size() <= 1000`.
11. **Timestamp Manipulation**: User creates a submission with `{ createdAt: "2020-01-01" }` or backdated client timestamp -> Rejected by `incoming().createdAt == request.time`.
12. **Credential Table Enumeration**: Non-admin attempts `list` query on `/partner_auth` to scrape partner login hashes -> Rejected by `allow list: if isSuperAdmin()`.

## 3. Test Runner
See `/firestore.rules.test.ts` verifying all 12 Dirty Dozen payloads return `PERMISSION_DENIED` while legitimate public browsing, student submissions, and responsible-admin confirmations succeed.
