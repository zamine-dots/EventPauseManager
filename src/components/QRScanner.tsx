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
  const [isScanning, setIsScanning] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const cleanupRef = useRef(false);

  // Request camera permission first
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop the stream immediately, we just wanted to request permission
        stream.getTracks().forEach(track => track.stop());
        setPermissionStatus('granted');
        setIsScanning(true);
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          setPermissionStatus('denied');
          setError('Camera permission denied. Please allow access to your camera.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera device found. Please check your device.');
        } else {
          setError('Failed to access camera: ' + err.message);
        }
        setIsScanning(false);
      }
    };

    requestCameraPermission();

    return () => {
      cleanupRef.current = true;
    };
  }, []);

  // Initialize scanner only after permission is granted
  useEffect(() => {
    if (!isScanning || cleanupRef.current) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (cleanupRef.current) return;

      try {
        // Check if scanner is already running
        if (scannerRef.current) return;

        // Ensure container exists
        const container = document.getElementById('qr-scanner-container');
        if (!container) {
          setError('Scanner container not found');
          return;
        }

        const scanner = new Html5QrcodeScanner(
          'qr-scanner-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          try {
            // Extract participant ID from URL
            const match = decodedText.match(/\/scan\/([a-f0-9\-]+)$/);
            if (match) {
              const participantId = match[1];
              
              // Stop scanning immediately
              if (scannerRef.current) {
                await scannerRef.current.clear();
                scannerRef.current = null;
              }
              setIsScanning(false);

              // Fetch participant
              const response = await axios.get(`/api/participant/${participantId}`);
              onScan(response.data);
            }
          } catch (err: any) {
            console.error('Error processing QR code:', err);
            setError(err.response?.data?.error || 'Participant not found!');
          }
        },
        (error) => {
          // Silently ignore scan errors
          if (process.env.NODE_ENV === 'development') {
            console.debug('QR scan attempt:', error);
          }
        }
      );
    } catch (err: any) {
      console.error('Scanner initialization error:', err);
      setError(err.message || 'Failed to initialize scanner');
      setIsScanning(false);
    }
    }, 0);

    return () => {
      if (scannerRef.current && cleanupRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isScanning, onScan]);

  const handleClose = async () => {
    cleanupRef.current = true;
    setIsScanning(false);
    
    // Stop the scanner
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
      scannerRef.current = null;
    }
    
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    setPermissionStatus('pending');
    cleanupRef.current = false;
    
    // Request permission again
    const requestPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionStatus('granted');
        setIsScanning(true);
      } catch (err: any) {
        setPermissionStatus('denied');
        setError('Camera permission denied.');
      }
    };
    
    requestPermission();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📱 Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="text-2xl hover:text-gray-200 transition font-bold"
          >
            ✕
          </button>
        </div>

        {/* Scanner Container */}
        <div className="p-6">
          {permissionStatus === 'denied' ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-red-600 font-semibold mb-4">{error}</p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4 text-left text-sm text-gray-700">
                <p className="font-bold mb-2">How to allow camera:</p>
                <ul className="space-y-2 text-xs">
                  <li><strong>Chrome/Edge:</strong> Click 🔒 in address bar → Camera → Allow</li>
                  <li><strong>Firefox:</strong> Click 🔒 in address bar → Camera → Allow</li>
                  <li><strong>Safari:</strong> Settings → Privacy → Camera → Allow</li>
                  <li><strong>Mobile:</strong> Settings → App Permissions → Camera</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-red-600 font-semibold mb-4">{error}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          ) : isScanning ? (
            <>
              <div
                id="qr-scanner-container"
                className="rounded-lg overflow-hidden border-2 border-gray-300 bg-black"
                style={{ width: '100%', height: '300px' }}
              ></div>
              <p className="text-center text-gray-500 text-sm mt-4">
                📸 Point camera at QR code
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-4">⏳</div>
              <p className="text-gray-600 font-semibold">Initializing camera...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
