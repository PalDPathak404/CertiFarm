import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiCamera, FiAlertCircle } from 'react-icons/fi';

const QRScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        // Success callback
        scanner.clear();
        onScan(decodedText);
      },
      (errorMessage) => {
        // Error callback (ignore scan errors, only show permission errors)
        if (errorMessage.includes('NotAllowedError') || errorMessage.includes('permission')) {
          setError('Camera access denied. Please allow camera access to scan QR codes.');
        }
      }
    );

    scannerRef.current = scanner;
    setIsScanning(true);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="qr-scanner-container">
      {error ? (
        <div className="text-center py-8">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      ) : (
        <>
          <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
          <p className="text-sm text-gray-500 text-center mt-4">
            Point your camera at the QR code on the certificate
          </p>
        </>
      )}
      
      <style jsx>{`
        #qr-reader {
          width: 100%;
          border: none !important;
        }
        #qr-reader video {
          border-radius: 8px;
        }
        #qr-reader__scan_region {
          background: transparent !important;
        }
        #qr-reader__dashboard {
          padding: 10px 0 !important;
        }
        #qr-reader__dashboard button {
          padding: 8px 16px !important;
          border-radius: 8px !important;
          background: #22c55e !important;
          color: white !important;
          border: none !important;
          cursor: pointer !important;
        }
        #qr-reader__dashboard select {
          padding: 8px !important;
          border-radius: 8px !important;
          border: 1px solid #e5e7eb !important;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;