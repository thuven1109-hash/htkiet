# Security Specification - Hồi Ức Nam Kỳ

## 1. Data Invariants
- A user can only read and write their own profile, API keys, and chat sessions.
- Document IDs for user subcollections (specifically user profile) must match the authenticated UID.
- Timestamps must be validated against `request.time`.

## 2. The "Dirty Dozen" Payloads (Malicious Attempts)
1. Attempt to read `users/attacker_uid/sessions/victim_session` from `victim_uid`. (Expect: DENIED)
2. Attempt to create a session with a `userId` field that doesn't match `request.auth.uid`. (Expect: DENIED)
3. Attempt to set `email` in `users/uid` to someone else's email. (Expect: DENIED)
4. Attempt to update `updatedAt` with a client-provided future timestamp. (Expect: DENIED)
5. Attempt to push a 2MB string into an API key array. (Expect: DENIED)
6. Attempt to delete a session belonging to another user. (Expect: DENIED)
7. Attempt to write to `users/{userId}/config/apiKeys` without being authenticated. (Expect: DENIED)
8. Attempt to list all sessions in the root collection (if it were allowed). (Expect: DENIED)
9. Attempt to inject a field `isAdmin: true` into a session object. (Expect: DENIED)
10. Attempt to spoof `email_verified` state. (Expect: DENIED)
11. Attempt to create a session with an invalid ID format. (Expect: DENIED)
12. Attempt to update a session's `id` field (immutable). (Expect: DENIED)

## 3. Test Runner Concept
The rules will enforce `userId` checks at every level. `request.auth.uid` must match the parent document ID in the path `/users/{userId}/...`.
