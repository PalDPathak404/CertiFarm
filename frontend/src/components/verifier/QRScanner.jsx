import React, { useEffect, useRef, useState } from 'react';
import { FiCamera, FiAlertCircle } from 'react-icons/fi';

const QRScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initScanner = async () => {
      try {
        // Dynamically import html5-qrcode
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        
        if (!isMounted) return;

        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

        html5QrCodeRef.current = scanner;

        scanner.render(
          (decodedText) => {
            // Success callback
            if (isMounted) {
              scanner.clear().catch(console.error);
              onScan(decodedText);
            }
          },
          (errorMessage) => {
            // Error callback - only show permission errors
            if (errorMessage.includes('NotAllowedError') || errorMessage.includes('permission')) {
              if (isMounted) {
                setError('Camera access denied. Please allow camera access to scan QR codes.');
              }
            }
          }
        );

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize QR scanner:', err);
        if (isMounted) {
          setError('Failed to initialize camera. Please try again or enter the credential ID manually.');
          setIsLoading(false);
        }
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Initializing camera...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={onClose} 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="qr-scanner-container">
      <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
      <p className="text-sm text-gray-500 text-center mt-4">
        Point your camera at the QR code on the certificate
      </p>
    </div>
  );
};

export default QRScanner;