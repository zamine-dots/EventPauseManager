'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Participant } from '@/db/init';
import axios from 'axios';

interface QRScannerProps {
  onScan: (participant: Participant) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isScanning) return;

    try {
      const scanner = new Html5QrcodeScanner(
        'qr-scanner-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
          disableFlip: false,
          rememberLastUsedCamera: true,
        },
        true
      );

      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          // Extract participant ID from URL
          const match = decodedText.match(/\/scan\/([a-f0-9\-]+)$/);
          if (match) {
            const participantId = match[1];
            setIsScanning(false);

            try {
              const response = await axios.get(`/api/participant/${participantId}`);
              onScan(response.data);
            } catch (err) {
              setError('Participant not found!');
              setIsScanning(true);
            }
          }
        },
        (error) => {
          // Check for permission denied
          if (error && error.toString().includes('NotAllowedError')) {
            setPermissionDenied(true);
            setError('Camera permission denied. Please allow access to your camera.');
            setIsScanning(false);
          }
        }
      );
    } catch (err: any) {
      console.error('Scanner error:', err);
      if (err.toString().includes('NotAllowedError') || err.toString().includes('Permission')) {
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow access to your camera.');
      } else {
        setError(err.message || 'Failed to initialize scanner');
      }
      setIsScanning(false);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isScanning, onScan]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📱 Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Scanner Container */}
        <div className="p-6">
          {permissionDenied ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-red-600 font-semibold mb-4">{error}</p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4 text-left text-sm text-gray-700">
                <p className="font-bold mb-2">How to allow camera access:</p>
                <div className="space-y-2">
                  <p><strong>Chrome/Edge:</strong> Click the 🔒 icon in address bar → Camera → Allow</p>
                  <p><strong>Firefox:</strong> Click the 🔒 icon → Camera → Allow</p>
                  <p><strong>Safari:</strong> Settings → Privacy → Camera → Allow</p>
                  <p><strong>Mobile:</strong> App Settings → Permissions → Camera → Allow</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setPermissionDenied(false);
                  setIsScanning(true);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-2"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-red-600 font-semibold mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setIsScanning(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div
                id="qr-scanner-container"
                className="rounded-lg overflow-hidden border-2 border-gray-300"
                style={{ width: '100%', height: '300px' }}
              ></div>
              <p className="text-center text-gray-500 text-sm mt-4">
                Point camera at QR code to scan
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
