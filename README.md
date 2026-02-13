# 🌍 Microservices Architecture Diagram

This document describes the high-level architecture of the system.

## 📌 Architecture Overview

```mermaid
graph TD
    User["🌍 Client / Frontend"] --> Gateway["🚪 API Gateway (8080)"]

    %% ---------------- Security & Discovery ----------------
    subgraph "🔐 Security & Discovery"
        Gateway --> Eureka["🔎 Discovery Server (8761)"]
        Gateway --> Identity["🆔 User Identity Service (8081)"]
    end

    %% ---------------- Business Domain ----------------
    subgraph "🏢 Business Domain"
        Gateway --> Org["🏢 Organization Service"]
        Gateway --> Emission["📉 Emission Reporting Service"]
        Gateway --> Verify["✅ Verification Service"]
        Gateway --> Credit["💎 Credit Issuance Service"]
    end

    %% ---------------- Trading & Audit ----------------
    subgraph "📈 Trading & Audit"
        Gateway --> Trading["📊 Trading Service (8086)"]
        Trading -- "Publishes Event" --> Kafka["🚀 Kafka Broker"]
        Kafka -- "Consumes Event" --> Audit["📜 Audit Ledger Service"]
    end

    %% ---------------- Persistence ----------------
    subgraph "📦 Persistence"
        Identity & Org & Trading & Credit --> DB[("🐘 PostgreSQL")]
    end
