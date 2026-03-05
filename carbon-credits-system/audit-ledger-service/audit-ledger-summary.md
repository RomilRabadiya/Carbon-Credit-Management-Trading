# Audit Ledger Service Overview

The `audit-ledger-service` is a critical component of the Carbon Credit System designed for **immutability**, **transparency**, and **compliance**. It serves as the "source of truth" for all activities within the ecosystem.

## Primary Functions

### 1. Event Capture (via Kafka)
The service listens to various system events published to Kafka topics and records them permanently:
- **Emission Reported**: Captures when an organization submits a new report (`emission-topic`).
- **Emission Verified**: Records the outcome of verifications (`EMISSION_VERIFIED`).
- **Credit Issued**: Records the minting of new carbon credits (`credit-issued-topic`).

### 2. Dual-Record Keeping
For every significant event, the service maintains two types of records:
- **Audit Logs**: A timestamped trail of "what happened, when, and by whom." Includes status and human-readable remarks.
- **Financial Ledger**: A debit/credit system that tracks the movement of carbon credit "currency" across accounts.

### 3. API Provisioning
Provides REST endpoints for the frontend and other services to query history and statistics:
- Transaction history for organizations.
- Aggregated statistics (total traded, retired, etc.).
- Financial ledger views.

---

## How to Test the Service

You can test the service using `curl` commands or tools like Postman.

### 1. Test REST API Endpoints
Since the service runs on port `8086` (proxied via API Gateway on `8080`), you can test the following:

**Get all logs for an organization:**
```bash
curl -X GET "http://localhost:8080/api/audit/logs/organization/1" \
     -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Get ledger entries for an organization:**
```bash
curl -X GET "http://localhost:8080/api/audit/ledger/organization/1" \
     -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Get stats (The endpoint we recently added):**
```bash
curl -X GET "http://localhost:8080/api/audit/transactions/stats?orgId=1" \
     -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 2. Test Kafka Integration (Simulate Events)
To test if the service is correctly recording events, you can push a mock message to Kafka using the Kafka console producer:

**Simulate Credit Issuance:**
```bash
# Enter the kafka container or use local kafka-console-producer
kafka-console-producer --bootstrap-server localhost:9092 --topic credit-issued-topic
```
Then paste this JSON:
```json
{"id": "test-123", "organizationId": 1, "amount": 500}
```

### 3. Database Verification
After running the tests above, check the database tables `audit_logs` and `ledger_entries` to ensure the records were persisted.

```sql
SELECT * FROM audit_logs WHERE source_organization_id = 1;
SELECT * FROM ledger_entries WHERE organization_id = 1;
```
