# Audit Ledger: Transaction Triggers

This document describes exactly **when** and **how** entries are added to the Audit Ledger.

## 1. Emission Reporting
**Trigger**: When an organization submits a new Carbon Emission Report.
- **Service**: `core-service` (`EmissionService#submitReport`)
- **Event**: `EMISSION_REPORTED`
- **Topic**: `emission-topic`
- **Audit Ledger Action**: Records a new `AuditLog` entry with type `EMISSION_REPORTED` and status `COMPLETED`.

## 2. Verification Processing
**Trigger**: When a designated verifier approves or rejects a pending emission report.
- **Service**: `core-service` (`VerificationService#approveVerification` or `#rejectVerification`)
- **Event**: `VERIFICATION_COMPLETED`
- **Topic**: `EMISSION_VERIFIED`
- **Audit Ledger Action**: Records a new `AuditLog` entry with type `VERIFICATION_COMPLETED` and the verifier's status/remarks.

## 3. Credit Issuance (Minting)
**Trigger**: When credits are officially assigned to an organization (usually follows an approved verification).
- **Service**: `core-service` (`CreditIssuanceService#issueCredits`)
- **Event**: `CREDIT_ISSUED`
- **Topic**: `credit-issued-topic`
- **Audit Ledger Action**:
    1. Records an `AuditLog` entry with type `CREDIT_ISSUED`.
    2. Records a **Financial Ledger** entry (`LedgerEntry`) reflecting a **Credit** to the organization's account.

## 4. Trading & Retirement (Future/Indirect)
Currently, **Trading** (Buying/Selling) and **Retirement** of credits are handled within the `trade-service` and recorded in its internal database.
- **Future Improvement**: These actions will spark Kafka events that the `audit-ledger-service` will listen to, adding them to the permanent, immutable ledger.

---

### How it works technically
The `audit-ledger-service` contains an `AuditEventListener` that runs continuously. It uses **Spring Kafka** to subscribe to the topics mentioned above. Every time a message arrives on those topics, the listener immediately saves the data to the Audit Ledger database.
