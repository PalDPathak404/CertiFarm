# 🌾 CertiFarm - Digital Product Passport for Agricultural Exports

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

**CertiFarm** is a web-based portal that enables agricultural exporters to submit product batches for quality inspection, QA agencies to issue digitally signed Verifiable Credentials (VCs), and importers/customs to verify certificates instantly using QR codes.

![CertiFarm Dashboard](https://via.placeholder.com/800x400/22c55e/ffffff?text=CertiFarm+Dashboard)

---

## 🎯 Problem Statement

India's agricultural export sector faces significant challenges:
- **15-20% rejection rates** at international customs due to documentation issues
- **7-10 day delays** in certification processes
- **Easy forgery** of paper certificates
- **No instant verification** mechanism for importers

## 💡 Our Solution

CertiFarm digitizes the agricultural export certification process using **W3C Verifiable Credentials** and provides:

- ✅ **Instant QR-based verification** (3 seconds vs 2-3 days)
- ✅ **Tamper-proof digital certificates** with cryptographic signatures
- ✅ **Complete traceability** from farm to destination
- ✅ **Multi-role portal** for exporters, QA agencies, and importers

---

## 🚀 Features

### For Exporters
- Submit product batches with detailed information
- Upload supporting documents (lab reports, images)
- Track batch status through the certification lifecycle
- Download QR codes and digital certificates

### For QA Agencies
- View and manage inspection queue
- Record quality parameters (moisture, pesticides, aflatoxins)
- Issue W3C-compliant Verifiable Credentials
- Digital signature for accountability

### For Importers/Customs
- Scan QR codes for instant verification
- View complete product and quality information
- Verify issuer authenticity
- Check certificate validity status

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18, Tailwind CSS, Vite |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Authentication** | JWT |
| **QR Generation** | qrcode.js |
| **VC Standard** | W3C Verifiable Credentials |

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-team/certifarm.git
cd certifarm

# Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev

# Frontend Setup (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/certifarm
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

---

## 📁 Project Structure

```
certifarm/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # VC & QR generators
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   ├── services/    # API services
│   │   └── App.jsx      # Main app
│   └── index.html
└── docs/                # Documentation
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Batches
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/batches` | Create new batch |
| GET | `/api/batches` | Get all batches |
| GET | `/api/batches/:id` | Get batch details |
| PUT | `/api/batches/:id` | Update batch |

### Inspections
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inspections/start/:batchId` | Start inspection |
| PUT | `/api/inspections/:id` | Submit inspection results |
| GET | `/api/inspections/pending` | Get pending inspections |

### Credentials
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/credentials/issue/:batchId` | Issue VC |
| GET | `/api/credentials/verify/:id` | Verify credential (Public) |
| GET | `/api/credentials/:id/qr` | Get QR code |

---

## 🎬 Demo

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Exporter | exporter@demo.com | demo123 |
| QA Agency | qa@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

### Demo Flow
1. **Login as Exporter** → Create a new batch
2. **Login as QA Agency** → Start inspection → Submit results → Issue certificate
3. **Visit /verify** → Scan QR or enter credential ID

---

## 📊 Verifiable Credential Schema

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1"
  ],
  "type": ["VerifiableCredential", "DigitalProductPassport"],
  "issuer": {
    "id": "did:certifarm:qa-agency-123",
    "name": "Certified QA Labs"
  },
  "credentialSubject": {
    "product": {
      "name": "Basmati Rice Premium",
      "batchId": "CF-2411-ABC123"
    },
    "qualityCertification": {
      "grade": "A",
      "moistureContent": "12.5%",
      "pesticideStatus": "Not Detected"
    }
  }
}
```

---

## 🏆 Hackathon Submission

### Team: [Your Team Name]

| Name | Role | Contribution |
|------|------|--------------|
| Member 1 | Full-Stack Lead | Backend APIs, VC integration |
| Member 2 | Frontend Developer | React UI, dashboards |
| Member 3 | DevOps & QA | Database, testing, deployment |
| Member 4 | Designer | UI/UX, pitch deck, documentation |

### Links
- 🌐 **Live Demo**: [https://certifarm.example.com](https://certifarm.example.com)
- 📹 **Demo Video**: [YouTube Link](https://youtube.com)
- 📑 **Pitch Deck**: [Google Slides](https://slides.google.com)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- IIT Madras E-Summit Team
- MOSIP Inji Documentation
- W3C Verifiable Credentials Working Group

---

**Built with ❤️ for Indian Agricultural Exporters**