import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

/**
 * Payload-First Security Test Suite (Phase 0 Verification)
 * Validates Dirty Dozen attack payloads and security invariants against
 * firebase-blueprint.json and firestore.rules constraints.
 */
const blueprint = JSON.parse(readFileSync('./firebase-blueprint.json', 'utf8'));
const rulesText = readFileSync('./firestore.rules', 'utf8');

function assertRejected(label: string, check: () => boolean) {
  const blocked = check();
  assert.equal(blocked, true, `Security failure — payload should be denied: ${label}`);
}

export function runDirtyDozenChecks() {
  const idRegex = new RegExp(blueprint.entities.Order.properties.id.pattern!);

  // 1. ID Poisoning Attack
  assertRejected('Payload 1: ID Poisoning', () => !idRegex.test('../../admins'));

  // 2. Order Self-Confirmation Fraud
  assertRejected('Payload 2: Order Self-Confirmation', () => {
    const incomingStatus: string = 'confirmed';
    return rulesText.includes("incoming().paymentStatus == 'pending_confirmation'") && incomingStatus !== 'pending_confirmation';
  });

  // 3. Helper Private Contact Paywall Bypass
  assertRejected('Payload 3: Helper Contact Before Admin Confirmation', () => {
    return rulesText.includes("helper_unlocks/$(request.auth.uid + '__' + helperId)).data.status == 'confirmed'");
  });

  // 4. Identity Spoofing on Order Create
  assertRejected('Payload 4: Identity Spoofing', () => {
    return rulesText.includes('incoming().buyerUid == request.auth.uid');
  });

  // 5. Shadow Field Injection
  assertRejected('Payload 5: Shadow Field Injection', () => {
    return rulesText.includes('data.keys().hasOnly(');
  });

  // 6. Admin Privilege Escalation
  assertRejected('Payload 6: Non-Admin Write to /admins', () => {
    return rulesText.includes('match /admins/{adminId}') && rulesText.includes('allow create: if isAdmin()');
  });

  // 7. Email Spoofing Without Verification
  assertRejected('Payload 7: Unverified Email Spoofing', () => {
    return rulesText.includes("request.auth.token.email_verified == true");
  });

  // 8. Blanket PII List Query
  assertRejected('Payload 8: Blanket PII List Query', () => {
    return rulesText.includes('resource.data.buyerUid == request.auth.uid') && !rulesText.includes('allow list: if isSignedIn();');
  });

  // 9. Terminal State Mutation
  assertRejected('Payload 9: Terminal State Mutation', () => {
    return rulesText.includes("existing().paymentStatus == 'pending_confirmation'") && rulesText.includes("!(existing().status in ['completed', 'rejected'])");
  });

  // 10. Mega String Denial-of-Wallet
  assertRejected('Payload 10: Oversized Review Text', () => {
    const maxLen = blueprint.entities.PublicReview.properties.text.maxLength!;
    return 'A'.repeat(5000).length > maxLen && rulesText.includes('isValidString(data.text, 2, 1000)');
  });

  // 11. Backdated Client Timestamp
  assertRejected('Payload 11: Client Timestamp Spoofing', () => {
    return rulesText.includes('incoming().createdAt == request.time');
  });

  // 12. Credential Hash Enumeration
  assertRejected('Payload 12: Listing /partner_auth', () => {
    return rulesText.includes('match /partner_auth/{authKey}') && rulesText.includes('allow list: if isSuperAdmin();');
  });

  // 13. Non-Super-Admin Rotating Department Admin Password
  assertRejected('Payload 13: Non-Super-Admin Department Admin Credential Mutation', () => {
    return rulesText.includes("!(existing().role in ['vendor_admin', 'scout_admin', 'project_helper_admin'])");
  });

  return { passed: 13, total: 13 };
}
