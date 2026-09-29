# Merix Backend - Legal Metrology Online Verification System

**Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution, Government of India**
*Smart India Hackathon 2026 - Problem Statement SIH26036*

---

## 🛠 Tech Stack
- **Framework**: Java 17 + Spring Boot 3.2.3
- **Security**: Spring Security + Stateless JWT
- **Database**: PostgreSQL / Supabase with JPA Hibernate & H2 in-memory fallback
- **API Spec**: OpenAPI 3.0 / Swagger UI
- **QR Engine**: ZXing QR Generation
- **Standard**: Legal Metrology Act, 2009 & Legal Metrology (General) Rules, 2011 / OIML R76

---

## 🚀 Running the Backend

### Prerequisites
- JDK 17+
- Maven 3.8+
- (Optional) Docker

### 1. Build and Run via Maven
```bash
cd backend
mvn clean spring-boot:run
```

### 2. Run via Docker
```bash
docker build -t merix-backend .
docker run -p 8080:8080 merix-backend
```

### 3. API Documentation (Swagger UI)
Once started, visit:
- **Swagger UI**: [http://localhost:8080/api/v1/swagger-ui.html](http://localhost:8080/api/v1/swagger-ui.html)
- **OpenAPI JSON**: [http://localhost:8080/api/v1/v3/api-docs](http://localhost:8080/api/v1/v3/api-docs)

---

## 🔑 Key Endpoints
| HTTP Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Role-based login (Business, LMO, GATC, Admin) |
| `GET` | `/api/v1/instruments` | List registered instruments |
| `POST` | `/api/v1/instruments/register` | Register new instrument + generate QR |
| `POST` | `/api/v1/instruments/ocr/extract` | AI OCR nameplate extractor |
| `GET` | `/api/v1/instruments/near-me` | Public Near Me verified instruments |
| `POST` | `/api/v1/applications` | Submit verification application |
| `POST` | `/api/v1/allocations` | Admin allocation to LMO/GATC |
| `POST` | `/api/v1/inspections/simulate-reading` | MPE calculation simulator |
| `POST` | `/api/v1/inspections/submit` | Complete inspection + issue digital cert |
| `GET` | `/api/v1/certificates/verify/{certNumber}`| Tamper-evident public certificate check |
| `POST` | `/api/v1/certificates/{certNumber}/digilocker-push` | Push certificate to Government DigiLocker wallet |
| `POST` | `/api/v1/certificates/{certNumber}/revoke` | Revoke certificate on detected seal tampering |
| `GET` | `/api/v1/reports/dashboard-stats` | Department Admin KPI metrics |
| `GET` | `/api/v1/audit-logs` | Immutable audit trail |

