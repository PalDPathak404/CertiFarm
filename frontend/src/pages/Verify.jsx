import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { credentialAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FiCheckCircle, FiXCircle, FiAlertCircle, FiSearch, 
  FiLeaf, FiPackage, FiMapPin, FiCalendar, FiAward,
  FiCamera, FiArrowLeft
} from 'react-icons/fi';
import QRScanner from '../components/verifier/QRScanner';

const Verify = () => {
  const { credentialId: urlCredentialId } = useParams();
  const [credentialId, setCredentialId] = useState(urlCredentialId || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (urlCredentialId) {
      handleVerify(urlCredentialId);
    }
  }, [urlCredentialId]);

  const handleVerify = async (id) => {
    const searchId = id || credentialId;
    if (!searchId.trim()) {
      toast.error('Please enter a credential ID');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await credentialAPI.verify(searchId.trim());
      setResult(response.data);
    } catch (error) {
      console.error('Verification error:', error);
      setResult({
        success: false,
        verified: false,
        message: error.response?.data?.message || 'Verification failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanResult = (data) => {
    setShowScanner(false);
    try {
      const parsed = JSON.parse(data);
      if (parsed.id) {
        setCredentialId(parsed.id);
        handleVerify(parsed.id);
      } else if (parsed.i) {
        // Compact format
        setCredentialId(parsed.i);
        handleVerify(parsed.i);
      }
    } catch {
      // Assume it's a direct credential ID
      setCredentialId(data);
      handleVerify(data);
    }
  };

  const getStatusIcon = () => {
    if (!result) return null;
    if (result.verified) {
      return <FiCheckCircle className="w-16 h-16 text-green-500" />;
    }
    return <FiXCircle className="w-16 h-16 text-red-500" />;
  };

  const getStatusColor = () => {
    if (!result) return '';
    return result.verified ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FiLeaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">CertiFarm</span>
          </Link>
          <Link to="/login" className="btn btn-outline text-sm">
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Certificate
          </h1>
          <p className="text-gray-600">
            Verify the authenticity of a Digital Product Passport
          </p>
        </div>

        {/* Search Box */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="Enter Credential ID or scan QR code"
                className="input pl-10"
              />
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FiCamera /> Scan QR
            </button>
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              className="btn btn-primary flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <FiSearch /> Verify
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Scan QR Code</h3>
                <button onClick={() => setShowScanner(false)}>
                  <FiXCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <QRScanner onScan={handleScanResult} onClose={() => setShowScanner(false)} />
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className={`card border-2 ${getStatusColor()} animate-fade-in`}>
            {/* Status Header */}
            <div className="text-center pb-6 border-b border-gray-200">
              {getStatusIcon()}
              <h2 className={`text-2xl font-bold mt-4 ${result.verified ? 'text-green-700' : 'text-red-700'}`}>
                {result.verified ? 'Certificate Verified' : 'Verification Failed'}
              </h2>
              <p className="text-gray-600 mt-1">
                {result.verified 
                  ? 'This is a valid Digital Product Passport' 
                  : result.message || 'This certificate could not be verified'
                }
              </p>
            </div>

            {/* Certificate Details */}
            {result.verified && result.data && (
              <div className="pt-6 space-y-6">
                {/* Product Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Product Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <FiPackage className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Product</p>
                        <p className="font-medium">{result.data.product?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FiAward className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Grade</p>
                        <p className="font-medium">{result.data.qualityCertification?.grade || 'A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FiMapPin className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Origin</p>
                        <p className="font-medium">{result.data.origin?.country}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FiCalendar className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Issued</p>
                        <p className="font-medium">
                          {new Date(result.data.credential?.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality Parameters */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Quality Certification
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Moisture</p>
                      <p className="font-semibold text-primary-700">
                        {result.data.qualityCertification?.qualityParameters?.moistureContent || '< 14%'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Pesticides</p>
                      <p className="font-semibold text-green-700">
                        {result.data.qualityCertification?.qualityParameters?.pesticideStatus || 'Not Detected'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Organic</p>
                      <p className="font-semibold">
                        {result.data.qualityCertification?.qualityParameters?.organicCertified ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Result</p>
                      <p className="font-semibold text-green-700 capitalize">
                        {result.data.qualityCertification?.overallResult || 'Pass'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Issuer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Issued By
                  </h3>
                  <p className="font-medium">{result.data.issuer?.name}</p>
                  <p className="text-sm text-gray-500">{result.data.issuer?.id}</p>
                </div>

                {/* Verification Count */}
                <div className="text-center text-sm text-gray-500 pt-4 border-t">
                  This certificate has been verified {result.data.credential?.verificationCount || 1} time(s)
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        {!result && (
          <div className="card bg-blue-50 border border-blue-200">
            <div className="flex gap-3">
              <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">How to Verify</h3>
                <ul className="mt-2 text-sm text-blue-800 space-y-1">
                  <li>1. Enter the Credential ID from the certificate</li>
                  <li>2. Or scan the QR code on the product packaging</li>
                  <li>3. Click Verify to check authenticity</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Verify;