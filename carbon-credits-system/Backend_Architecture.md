# Carbon Credit System - Backend Architecture Documentation

This document provides a comprehensive overview of the backend architecture for the Carbon Credit System. It is designed to explain the microservices ecosystem, data flow, and infrastructure components.

## 1. High-Level Architecture Overview

The backend is built as a **Distributed Microservices Architecture** using **Spring Boot**. The system is composed of five specialized services that communicate via REST APIs and asynchronous messaging (Apache Kafka). 

All services store their persistent data in a shared/managed PostgreSQL database hosted on NeonDB, with specific schemas or tables mapped to each service's JPA entities.

### Core Technologies
*   **Framework:** Java / Spring Boot 3.x
*   **Database:** PostgreSQL (Cloud-hosted via NeonDB)
*   **Message Broker:** Apache Kafka / Zookeeper
*   **API Gateway:** Spring Cloud Gateway
*   **Authentication:** Stateless JWT (JSON Web Tokens)
*   **ORM:** Hibernate / Spring Data JPA
*   **Real-time Communication:** WebSockets (Spring WebSocket)

---

## 2. Microservices Breakdown

### 2.1 API Gateway (`api-gateway`)
*   **Port:** `8080`
*   **Role:** The single entry point for all client requests (Frontend/External APIs).
*   **Responsibilities:**
    *   **Route Handling:** Routes incoming HTTP requests to the appropriate downstream microservice based on URL path predicates.
    *   **Security/Auth:** Validates JWT signatures using a shared `jwt.secret`. Extracts claims and forwards user context (e.g., `X-User-Id`, `X-User-Role`) to deeper services.
    *   **CORS Management:** Handles Cross-Origin Resource Sharing logic for browser clients.
*   **Key Routing Rules:**
    *   `/api/users/**` ➔ User Service
    *   `/api/emissions/**` ➔ Core Service
    *   `/api/credits/**` ➔ Core Service
    *   `/api/verifications/**` ➔ Core Service
    *   `/api/trading/**` ➔ Trade Service

### 2.2 User Service (`user-service`)
*   **Port:** `8081`
*   **Role:** Identity and Access Management (IAM).
*   **Responsibilities:**
    *   User Registration and Login (JWT Generation).
    *   Role-Based Access Control (RBAC) definitions (`USER`, `ORGANIZATION`, `VERIFIER`, `ADMIN`).
    *   Organization profile management (associating users with Corporate or NGO entities).
    *   Wallet/Balance operations (adding funds to purchase credits).

### 2.3 Core Service (`core-service`)
*   **Port:** `8082`
*   **Role:** The heavy-lifter of the application, managing the lifecycle of emissions and carbon credits.
*   **Responsibilities:**
    *   **Emission Reporting:** Intake of carbon dioxide equivalent (tCO₂e) data submitted by organizations.
    *   **Verification Workflow:** Manages the approval pipeline where independent `VERIFIER` roles audit reported emissions.
    *   **Credit Issuance:** Upon successful verification, calculates and mints generic Carbon Credits assigned to the organization.
*   **Kafka Integrations:** 
    *   Acts as a **Producer**.
    *   Publishes events such as `emission-reported`, `credit-issued`, and `verification-completed` (`EMISSION_VERIFIED` topic) to trigger asynchronous downstream actions.

### 2.4 Trade Service (`trade-service`)
*   **Port:** `8083`
*   **Role:** The Marketplace engine.
*   **Responsibilities:**
    *   Manages "Listings" where organizations can put their minted carbon credits up for sale at a specific price per unit.
    *   Handles the transactional execution of buying/selling credits (transferring ownership from seller to buyer).
    *   Interfaces with User Service (or dedicated wallet tables) to verify funds and finalize financial settlement during a trade.

### 2.5 Notification Service (`notification-service`)
*   **Port:** `8084`
*   **Role:** Real-time user alert and broadcast system.
*   **Responsibilities:**
    *   Acts entirely as a **Kafka Consumer**.
    *   Listens to the broker asynchronously for events across the ecosystem (e.g., when a Verification is approved, or a Trade completes).
    *   Pushes live alerts directly to the connected user's browser via **WebSockets** (`ws://localhost:8084/ws/notifications`).

---

## 3. Data Flow & Event Driven Architecture

To ensure high availability and decoupled components, the system utilizes **Event-Driven Architecture** for cross-service state changes using **Apache Kafka** (`localhost:9092`).

### Example Flow: Verification to Issuance to Notification
1.  **Action:** A `VERIFIER` approves an emission report via the frontend.
2.  **API Gateway:** Routes the `PUT /api/verifications/{id}/approve` request to the **Core Service**.
3.  **Core Service (DB):** Updates the verification status to `APPROVED` in PostgreSQL.
4.  **Core Service (Kafka):** Mints a new Carbon Credit and produces a `credit-issued` event payload to the message broker.
5.  **Notification Service (Kafka):** Consumes the newly published `credit-issued` event.
6.  **Notification Service (WebSocket):** Identifies the owning Organization's active WebSocket session and pushes a JSON notification alerting them that their credits are ready.

---

## 4. Security Concept

*   **Stateless:** The backend maintains no session state. Every request requires authentication.
*   **JWT Transitive Trust:** The API Gateway intercepts the standard `Authorization: Bearer <token>` header, verifies the cryptographic signature, and subsequently passes sanitized identity headers (like `X-User-Id`) to backend microservices, preventing services from having to duplicate JWT validation logic.
*   **Role Guards:** Method-level security enforces access. E.g., only roles containing `VERIFIER` or `ADMIN` can hit endpoints to approve reports.

## 5. Potential Review Points for ChatGPT

When reviewing this architecture, you may want to ask ChatGPT about:
1.  **Saga Patterns:** Does the Trade Service implement proper distributed transactions (Saga/2PC) when deducting money from a User and transferring a Credit from Core simultaneously?
2.  **Database Separation:** Currently, it appears all services share the same NeonDB cluster. Should they have strictly isolated schemas or physical databases to comply with strict microservice boundaries?
3.  **Service Discovery:** Eureka is explicitly disabled in the configs (`eureka.client.enabled: false`). Gateway hardcodes `localhost:808x`. Is this intended for local dev, and how should it be containerized for production?
