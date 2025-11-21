# CertiFarm User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [For Exporters](#for-exporters)
3. [For QA Agencies](#for-qa-agencies)
4. [For Importers/Verifiers](#for-importersverifiers)

---

## Getting Started

### Registration

1. Navigate to `https://certifarm.example.com/register`
2. Select your role:
   - **Exporter**: If you're submitting agricultural products for certification
   - **QA Agency**: If you're inspecting and certifying products
   - **Importer**: If you're verifying imported products
3. Fill in your details and create an account
4. Login with your credentials

---

## For Exporters

### Step 1: Create a New Batch

1. Login to your account
2. Click **"New Batch"** on the dashboard
3. Fill in product details:
   - **Product Name**: e.g., "Basmati Rice Premium 1121"
   - **Category**: Select from dropdown (Rice, Wheat, Spices, etc.)
   - **Quantity**: Enter amount and unit
   - **Harvest Date**: When the product was harvested
4. Enter origin information (farm location, state)
5. Enter destination details (country, importer name)
6. Click **"Submit Batch"**

### Step 2: Track Your Batch

Your batch will go through these statuses:
1. **Submitted** → Waiting for QA agency
2. **Under Inspection** → QA agency is reviewing
3. **Inspection Complete** → Results submitted
4. **Certified** → Certificate issued ✅

### Step 3: Download Certificate

1. Go to **"Certificates"** section
2. Find your certified batch
3. Click **"Download QR"** to get the QR code
4. Print and attach to your export documentation

---

## For QA Agencies

### Step 1: View Pending Inspections

1. Login to your QA Agency account
2. Dashboard shows pending batches assigned to you
3. Urgent inspections are highlighted in red

### Step 2: Start an Inspection

1. Click **"Start"** on a pending batch
2. Review product and exporter information
3. Inspection status changes to "Under Inspection"

### Step 3: Enter Quality Parameters

Fill in test results:

| Parameter | Description | Example |
|-----------|-------------|---------|
| Moisture Content | % moisture | 12.5% |
| Foreign Matter | % impurities | 0.3% |
| Aflatoxin Level | ppb measurement | 5 ppb |
| Grade | Overall quality | A, B, C |

Check compliance standards:
- [ ] FSSAI Compliant
- [ ] Export Standards Met
- [ ] Destination Country Standards
- [ ] ISO Compliant

### Step 4: Submit Inspection

1. Select **Overall Result**: Pass / Fail / Conditional Pass
2. Add remarks and recommendations
3. Click **"Submit Inspection"**

### Step 5: Issue Certificate

1. After submission, click **"Issue Certificate"**
2. System generates W3C Verifiable Credential
3. QR code is automatically created
4. Exporter is notified

---

## For Importers/Verifiers

### Method 1: Scan QR Code

1. Go to `https://certifarm.example.com/verify`
2. Click **"Scan QR"**
3. Allow camera access
4. Point camera at QR code on packaging
5. View verification results instantly

### Method 2: Enter Credential ID

1. Go to `https://certifarm.example.com/verify`
2. Enter the credential ID (found on certificate)
3. Click **"Verify"**
4. View detailed certification information

### Understanding Verification Results

**✅ Certificate Verified**
- Green checkmark indicates valid certificate
- Shows product, quality, and issuer details
- Safe to import

**❌ Verification Failed**
- Red cross indicates invalid certificate
- Possible reasons: expired, revoked, or fake
- Do not proceed without further verification

---

## Frequently Asked Questions

### How long is a certificate valid?
Certificates are valid for 1 year from issuance date.

### Can a certificate be revoked?
Yes, QA agencies can revoke certificates if issues are discovered.

### What if I lose my QR code?
Login to your exporter account and download it again from the Certificates section.

### Is the verification free?
Yes, verification is free for anyone with the QR code or credential ID.

---

## Support

For technical support, contact:
- Email: support@certifarm.example.com
- Phone: +91 1800 XXX XXXX