# CertiFarm - Technical Architecture Document

## 1. System Overview

CertiFarm is a multi-role web application for issuing and verifying Digital Product Passports (DPPs) for agricultural exports using W3C Verifiable Credentials.

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Login/    │  │  Exporter   │  │  QA Agency  │  │  Verifier   │        │
│  │  Register   │  │  Dashboard  │  │  Dashboard  │  │   Portal    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ HTTP/REST API
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js + Express)                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          API Routes                                  │   │
│  │  /api/auth  │  /api/batches  │  /api/inspections  │  /api/credentials│  │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Controllers                                  │   │
│  │  authController │ batchController │ inspectionCtrl │ credentialCtrl │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          Utilities                                   │   │
│  │      vcGenerator.js       │        qrGenerator.js                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE (MongoDB)                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │   Users   │  │  Batches  │  │Inspections│  │Credentials│               │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Data Flow

### 3.1 Batch Submission Flow
```
Exporter → Create Batch → Auto-assign QA → Status: "submitted"
```

### 3.2 Inspection Flow
```
QA Agency → Start Inspection → Status: "under_inspection"
         → Submit Results → Status: "inspection_complete"
         → Issue VC → Status: "certified"
```

### 3.3 Verification Flow
```
Importer → Scan QR / Enter ID → API Verify → Display Results
```

## 4. Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['exporter', 'qa_agency', 'importer', 'admin'],
  organization: String,
  did: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Batches Collection
```javascript
{
  _id: ObjectId,
  batchId: String (unique, auto-generated),
  exporter: ObjectId (ref: User),
  product: {
    name: String,
    category: Enum,
    quantity: { value: Number, unit: String }
  },
  origin: { farmLocation, district, state, country },
  destination: { country, port, importerName },
  status: Enum ['submitted', 'under_inspection', 'certified', 'rejected'],
  assignedQA: ObjectId (ref: User),
  inspection: ObjectId (ref: Inspection),
  credential: ObjectId (ref: Credential)
}
```

### Credentials Collection
```javascript
{
  _id: ObjectId,
  credentialId: String (URN UUID),
  batch: ObjectId,
  inspection: ObjectId,
  verifiableCredential: {
    "@context": Array,
    type: Array,
    issuer: { id, name },
    issuanceDate: Date,
    expirationDate: Date,
    credentialSubject: Object,
    proof: Object
  },
  qrCode: { data: String (base64), payload: String },
  status: Enum ['active', 'revoked', 'expired']
}
```

## 5. W3C Verifiable Credential Structure

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1"
  ],
  "id": "urn:uuid:abc123...",
  "type": ["VerifiableCredential", "DigitalProductPassport"],
  "issuer": {
    "id": "did:certifarm:qa-123",
    "name": "Certified Quality Labs"
  },
  "issuanceDate": "2024-11-01T00:00:00Z",
  "expirationDate": "2025-11-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:certifarm:exporter-456",
    "product": { ... },
    "qualityCertification": { ... }
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2024-11-01T00:00:00Z",
    "proofValue": "..."
  }
}
```

## 6. Security Measures

| Layer | Mechanism |
|-------|-----------|
| Authentication | JWT tokens (7-day expiry) |
| Password | bcrypt with 12 salt rounds |
| Authorization | Role-based middleware |
| API Security | Helmet.js, CORS whitelist |
| Data Validation | express-validator |

## 7. Deployment Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel     │     │   Railway    │     │  MongoDB     │
│  (Frontend)  │────▶│  (Backend)   │────▶│   Atlas      │
└──────────────┘     └──────────────┘     └──────────────┘
```

## 8. Scalability Considerations

- **Horizontal Scaling**: Stateless backend allows multiple instances
- **Database**: MongoDB Atlas with auto-scaling
- **File Storage**: Move to AWS S3 for production
- **Caching**: Add Redis for frequently accessed data
- **CDN**: CloudFlare for static assets