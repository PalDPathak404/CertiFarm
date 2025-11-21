# CertiFarm API Documentation

**Base URL**: `http://localhost:5000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "password": "securepass123",
  "role": "exporter",
  "organization": "Kumar Exports Ltd",
  "phone": "+91 98765 43210"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "..." },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login
Authenticate user and get token.

**Request Body:**
```json
{
  "email": "rajesh@example.com",
  "password": "securepass123"
}
```

### GET /auth/me
Get current user profile. (Protected)

---

## Batch Endpoints

### POST /batches
Create a new batch. (Protected - Exporter only)

**Request Body:**
```json
{
  "product": {
    "name": "Basmati Rice Premium",
    "category": "rice",
    "variety": "1121 Sella",
    "quantity": { "value": 1000, "unit": "kg" },
    "harvestDate": "2024-10-01"
  },
  "origin": {
    "farmLocation": "Karnal",
    "district": "Karnal",
    "state": "Haryana",
    "country": "India"
  },
  "destination": {
    "country": "UAE",
    "port": "Dubai",
    "importerName": "Gulf Foods LLC"
  },
  "priority": "normal"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Batch submitted successfully",
  "data": {
    "batch": {
      "_id": "...",
      "batchId": "CF-2411-ABC123",
      "status": "submitted",
      ...
    }
  }
}
```

### GET /batches
Get all batches (filtered by user role). (Protected)

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by status |
| category | string | Filter by product category |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |

### GET /batches/:id
Get batch details by ID. (Protected)

### GET /batches/stats
Get batch statistics for dashboard. (Protected)

---

## Inspection Endpoints

### GET /inspections/pending
Get batches pending inspection. (Protected - QA Agency)

### POST /inspections/start/:batchId
Start inspection for a batch. (Protected - QA Agency)

**Request Body:**
```json
{
  "inspectionType": "physical"
}
```

### PUT /inspections/:id
Submit inspection results. (Protected - QA Agency)

**Request Body:**
```json
{
  "qualityParameters": {
    "moisture": { "value": 12.5, "acceptable": true },
    "foreignMatter": { "value": 0.3, "acceptable": true },
    "pesticideResidue": { "detected": false, "acceptable": true },
    "aflatoxin": { "value": 5, "acceptable": true },
    "grade": "A",
    "organicCertified": false
  },
  "compliance": {
    "fssaiCompliant": true,
    "exportStandards": true,
    "destinationCountryStandards": true,
    "isoCompliant": true,
    "isoCodes": ["ISO 22000"]
  },
  "overallResult": "pass",
  "remarks": "Product meets all quality standards",
  "recommendations": "Ready for export"
}
```

---

## Credential Endpoints

### POST /credentials/issue/:batchId
Issue Verifiable Credential for a batch. (Protected - QA Agency)

**Response (201):**
```json
{
  "success": true,
  "message": "Credential issued successfully",
  "data": {
    "credential": {
      "credentialId": "urn:uuid:abc123...",
      "status": "active",
      "qrCode": { "data": "data:image/png;base64,..." },
      "verifiableCredential": { ... }
    }
  }
}
```

### GET /credentials/verify/:credentialId
Verify a credential. (Public - No auth required)

**Response (200):**
```json
{
  "success": true,
  "verified": true,
  "verificationResult": {
    "isValid": true,
    "checks": {
      "notExpired": true,
      "notRevoked": true,
      "signatureValid": true
    }
  },
  "data": {
    "credential": { "id": "...", "status": "active", "issuedAt": "..." },
    "product": { "name": "...", "category": "..." },
    "qualityCertification": { "grade": "A", "overallResult": "pass" },
    "issuer": { "name": "Certified Quality Labs" }
  }
}
```

### PUT /credentials/:id/revoke
Revoke a credential. (Protected - QA Agency/Admin)

**Request Body:**
```json
{
  "reason": "Quality issue discovered"
}
```

### GET /credentials/:id/qr
Get QR code for credential. (Protected)

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

**Common HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Postman Collection

Import this URL into Postman:
```
https://certifarm.example.com/api/postman-collection.json
```