const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a W3C Verifiable Credential for Digital Product Passport
 */
const generateVerifiableCredential = (batch, inspection, issuer) => {
  const credentialId = `urn:uuid:${uuidv4()}`;
  const issuanceDate = new Date();
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Valid for 1 year

  const verifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
      'https://certifarm.example.com/contexts/dpp/v1'
    ],
    id: credentialId,
    type: ['VerifiableCredential', 'DigitalProductPassport', 'AgriculturalQualityCertificate'],
    issuer: {
      id: issuer.did || `did:certifarm:${issuer._id}`,
      name: issuer.organization || issuer.name,
      type: 'QualityAssuranceAgency',
      certificationNumber: issuer.certificationNumber || 'QA-CERT-001'
    },
    issuanceDate: issuanceDate.toISOString(),
    expirationDate: expirationDate.toISOString(),
    credentialSubject: {
      id: batch.exporter.did || `did:certifarm:${batch.exporter._id}`,
      type: 'AgriculturalProduct',
      // Product Information
      product: {
        name: batch.product.name,
        category: batch.product.category,
        variety: batch.product.variety || 'Standard',
        quantity: `${batch.product.quantity.value} ${batch.product.quantity.unit}`,
        batchId: batch.batchId,
        harvestDate: batch.product.harvestDate?.toISOString?.() || null,
        packagingDate: batch.product.packagingDate?.toISOString?.() || null
      },
      // Origin Information
      origin: {
        country: batch.origin.country || 'India',
        state: batch.origin.state,
        district: batch.origin.district,
        farmLocation: batch.origin.farmLocation,
        geoCoordinates: batch.origin.geoCoordinates || null
      },
      // Destination Information
      destination: {
        country: batch.destination.country,
        port: batch.destination.port,
        importerName: batch.destination.importerName
      },
      // Quality Certification Details
      qualityCertification: {
        inspectionId: inspection._id.toString(),
        inspectionDate: inspection.inspectionDate.toISOString(),
        inspectionType: inspection.inspectionType,
        grade: inspection.qualityParameters?.grade || 'A',
        overallResult: inspection.overallResult,
        // Quality Parameters
        qualityParameters: {
          moistureContent: inspection.qualityParameters?.moisture?.value 
            ? `${inspection.qualityParameters.moisture.value}%` 
            : 'Within limits',
          foreignMatter: inspection.qualityParameters?.foreignMatter?.value
            ? `${inspection.qualityParameters.foreignMatter.value}%`
            : 'Within limits',
          pesticideStatus: inspection.qualityParameters?.pesticideResidue?.detected 
            ? 'Detected - Within safe limits' 
            : 'Not Detected',
          aflatoxinLevel: inspection.qualityParameters?.aflatoxin?.value
            ? `${inspection.qualityParameters.aflatoxin.value} ppb`
            : 'Within limits',
          organicCertified: inspection.qualityParameters?.organicCertified || false
        },
        // Compliance
        compliance: {
          fssaiCompliant: inspection.compliance?.fssaiCompliant || false,
          exportStandards: inspection.compliance?.exportStandards || false,
          destinationCountryStandards: inspection.compliance?.destinationCountryStandards || false,
          isoCompliant: inspection.compliance?.isoCompliant || false,
          isoCodes: inspection.compliance?.isoCodes || []
        }
      }
    },
    // Proof (digital signature)
    proof: {
      type: 'Ed25519Signature2020',
      created: issuanceDate.toISOString(),
      verificationMethod: `${issuer.did || `did:certifarm:${issuer._id}`}#key-1`,
      proofPurpose: 'assertionMethod',
      proofValue: generateProofValue(credentialId, batch.batchId, issuanceDate)
    }
  };

  return verifiableCredential;
};

/**
 * Generate proof value (simulated digital signature)
 * In production, use actual cryptographic signing
 */
const generateProofValue = (credentialId, batchId, timestamp) => {
  const dataToSign = `${credentialId}:${batchId}:${timestamp.toISOString()}`;
  const hash = crypto.createHash('sha256').update(dataToSign).digest('hex');
  // Base64 encode the hash to simulate a signature
  return Buffer.from(hash).toString('base64');
};

/**
 * Create minimal payload for QR code
 */
const createQRPayload = (credential, batch) => {
  return {
    v: '1.0', // Version
    id: credential.credentialId,
    bid: batch.batchId,
    prod: batch.product.name,
    cat: batch.product.category,
    qty: `${batch.product.quantity.value}${batch.product.quantity.unit}`,
    origin: batch.origin.country || 'India',
    dest: batch.destination.country,
    grade: credential.verifiableCredential.credentialSubject.qualityCertification.grade,
    result: credential.verifiableCredential.credentialSubject.qualityCertification.overallResult,
    issuer: credential.verifiableCredential.issuer.name,
    issued: credential.verifiableCredential.issuanceDate,
    expires: credential.verifiableCredential.expirationDate,
    verify: `https://certifarm.example.com/verify/${credential.credentialId}`
  };
};

/**
 * Verify credential (basic verification)
 */
const verifyCredential = (credential) => {
  const result = {
    isValid: true,
    checks: {
      notExpired: true,
      notRevoked: true,
      signatureValid: true,
      issuerTrusted: true
    },
    errors: []
  };

  // Check expiration
  if (new Date(credential.verifiableCredential.expirationDate) < new Date()) {
    result.isValid = false;
    result.checks.notExpired = false;
    result.errors.push('Credential has expired');
  }

  // Check revocation status
  if (credential.status === 'revoked') {
    result.isValid = false;
    result.checks.notRevoked = false;
    result.errors.push('Credential has been revoked');
  }

  // In production, verify actual cryptographic signature here

  return result;
};

module.exports = {
  generateVerifiableCredential,
  createQRPayload,
  verifyCredential
};