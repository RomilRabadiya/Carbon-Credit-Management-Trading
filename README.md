# 🌍 Carbon Credit Management & Trading System

A **microservices-based system** for managing, issuing, trading, and auditing carbon credits using **Spring Boot, Spring Cloud, Kafka, and Docker**.

---

## 🧩 Microservices Architecture (Overview)
```
carbon-credit-system/
│
├── api-gateway/
├── discovery-server/
├── config-server/
│
├── identity-service/
├── organization-service/
├── emission-service/
├── verification-service/
├── credit-service/
├── trading-service/
├── audit-service/
│
├── common-lib/
├── docker/
├── docs/
└── README.md
```

### 🔑 Key Principles
- Each service is an **independent Spring Boot application**
- Each service has its **own database/schema**
- Communication via **REST + Kafka**
- **Loose coupling & high scalability**

---

## 🧠 Core Infrastructure Services

### 1️⃣ Discovery Server (Eureka)
```
discovery-server/
├── src/main/java/com/carbon/discovery
│   └── DiscoveryServerApplication.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

**Responsibilities**
- Service registration
- Service discovery
- Load balancing support

📌 All services register here

---

### 2️⃣ Config Server (Spring Cloud Config)
```
config-server/
├── src/main/java/com/carbon/config
│   └── ConfigServerApplication.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

**Configuration Repository**
```
carbon-credit-config-repo/
├── identity-service.yml
├── emission-service.yml
├── credit-service.yml
└── application-common.yml
```

---

### 3️⃣ API Gateway (Spring Cloud Gateway)
```
api-gateway/
├── src/main/java/com/carbon/gateway
│   ├── ApiGatewayApplication.java
│   ├── config/
│   │   └── GatewayConfig.java
│   └── security/
│       └── JwtAuthFilter.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

**Responsibilities**
- Single entry point
- JWT validation
- Routing requests to services

📌 No business logic

---

## 🔐 Authentication & Identity

### 4️⃣ Identity Service (Auth + JWT)
```
identity-service/
├── src/main/java/com/carbon/identity
│   ├── controller/AuthController.java
│   ├── service/AuthService.java
│   ├── entity/User.java
│   ├── entity/Role.java
│   ├── repository/UserRepository.java
│   ├── security/
│   │   ├── JwtUtil.java
│   │   ├── SecurityConfig.java
│   │   └── UserDetailsServiceImpl.java
│   └── IdentityServiceApplication.java
│
├── src/main/resources/application.yml
└── pom.xml
```

**Responsibilities**
- User registration & login
- JWT issuance
- User validation

📌 Other services trust JWT issued here

---

## 🏢 Domain Microservices

### 5️⃣ Organization Service
```
organization-service/
├── controller/OrganizationController.java
├── service/OrganizationService.java
├── entity/Organization.java
├── repository/OrganizationRepository.java
└── OrganizationServiceApplication.java
```

📌 Owns Organization database

---

### 6️⃣ Emission Reporting Service
```
emission-service/
├── controller/EmissionController.java
├── service/EmissionService.java
├── entity/EmissionReport.java
├── repository/EmissionRepository.java
├── event/EmissionSubmittedEvent.java
└── EmissionServiceApplication.java
```

📌 Publishes Kafka Event: **EMISSION_SUBMITTED**

---

### 7️⃣ Verification Service
```
verification-service/
├── controller/VerificationController.java
├── service/VerificationService.java
├── entity/Verification.java
├── repository/VerificationRepository.java
├── kafka/
│   ├── EmissionEventListener.java
│   └── VerificationEventPublisher.java
└── VerificationServiceApplication.java
```

📌 Listens: **EMISSION_SUBMITTED**  
📌 Publishes: **EMISSION_VERIFIED**

---

### 8️⃣ Carbon Credit Service (Issuance)
```
credit-service/
├── controller/CreditController.java
├── service/CreditService.java
├── entity/CarbonCredit.java
├── repository/CreditRepository.java
├── kafka/VerificationEventListener.java
└── CreditServiceApplication.java
```

📌 Issues credits only after **EMISSION_VERIFIED**

---

### 9️⃣ Trading Service
```
trading-service/
├── controller/TradingController.java
├── service/TradingService.java
├── entity/Transaction.java
├── repository/TransactionRepository.java
├── kafka/TradeEventPublisher.java
└── TradingServiceApplication.java
```

📌 Publishes: **CREDIT_TRADED**

---

## 📜 Trust & Audit

### 🔟 Audit Service (Event-Driven)
```
audit-service/
├── entity/AuditLog.java
├── repository/AuditRepository.java
├── kafka/
│   ├── AuditEventListener.java
│   └── AuditTopics.java
└── AuditServiceApplication.java
```

**Consumes Kafka Events**
- EMISSION_SUBMITTED
- EMISSION_VERIFIED
- CREDIT_ISSUED
- CREDIT_TRADED
- CREDIT_RETIRED

📌 No REST APIs (Kafka only)

---

## 📦 Common Library (Shared)
```
common-lib/
├── dto/
├── enums/
│   ├── Role.java
│   ├── OrgType.java
│   ├── CreditStatus.java
│   └── ReportStatus.java
├── event/BaseEvent.java
└── pom.xml
```

📌 Shared via Maven dependency

---

## 🐳 Docker & DevOps
```
docker/
├── docker-compose.yml
├── kafka.yml
├── postgres.yml
└── gateway.yml
```

📌 Enables **one-command startup**

---

## 📊 Documentation
```
docs/
├── architecture-diagram.png
├── data-flow.png
├── er-diagram.png
├── sequence-diagram.png
```

---

## 🚀 Tech Stack
- Java 17
- Spring Boot
- Spring Cloud (Eureka, Config, Gateway)
- Kafka
- PostgreSQL
- Docker & Docker Compose
- JWT Security
---
