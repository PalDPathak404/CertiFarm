const QRCode = require('qrcode');

/**
 * Generate QR code as base64 data URL
 */
const generateQRCode = async (data, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    };

    const qrOptions = { ...defaultOptions, ...options };

    // Convert data to string if it's an object
    const dataString = typeof data === 'object' ? JSON.stringify(data) : data;

    // Generate QR code as data URL (base64)
    const qrDataUrl = await QRCode.toDataURL(dataString, qrOptions);

    return {
      success: true,
      dataUrl: qrDataUrl,
      rawData: dataString
    };
  } catch (error) {
    console.error('QR generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate QR code as SVG string
 */
const generateQRCodeSVG = async (data, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'svg',
      margin: 2,
      width: 300
    };

    const qrOptions = { ...defaultOptions, ...options };
    const dataString = typeof data === 'object' ? JSON.stringify(data) : data;

    const svgString = await QRCode.toString(dataString, qrOptions);

    return {
      success: true,
      svg: svgString,
      rawData: dataString
    };
  } catch (error) {
    console.error('QR SVG generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate QR code and save to file
 */
const generateQRCodeFile = async (data, filePath, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'png',
      margin: 2,
      width: 300
    };

    const qrOptions = { ...defaultOptions, ...options };
    const dataString = typeof data === 'object' ? JSON.stringify(data) : data;

    await QRCode.toFile(filePath, dataString, qrOptions);

    return {
      success: true,
      filePath,
      rawData: dataString
    };
  } catch (error) {
    console.error('QR file generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create verification URL for QR
 */
const createVerificationURL = (credentialId, baseUrl = 'https://certifarm.example.com') => {
  return `${baseUrl}/verify/${encodeURIComponent(credentialId)}`;
};

/**
 * Generate compact QR payload (for smaller QR codes)
 */
const createCompactPayload = (credential) => {
  // Use short keys to minimize QR code size
  return {
    i: credential.credentialId.replace('urn:uuid:', ''), // ID (shortened)
    b: credential.batch?.batchId, // Batch ID
    p: credential.verifiableCredential?.credentialSubject?.product?.name, // Product
    g: credential.verifiableCredential?.credentialSubject?.qualityCertification?.grade, // Grade
    r: credential.verifiableCredential?.credentialSubject?.qualityCertification?.overallResult, // Result
    d: credential.verifiableCredential?.issuanceDate?.split('T')[0], // Date (YYYY-MM-DD only)
    s: credential.status === 'active' ? 1 : 0 // Status (1=active, 0=inactive)
  };
};

module.exports = {
  generateQRCode,
  generateQRCodeSVG,
  generateQRCodeFile,
  createVerificationURL,
  createCompactPayload
};