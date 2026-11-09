'use client';

import React from 'react';
import { Participant } from '@/db/init';
import Image from 'next/image';
import { downloadQRCodeAsImage } from '@/lib/qrcode';

interface QRCodeModalProps {
  participants: Participant[];
  onClose: () => void;
}

export default function QRCodeModal({ participants, onClose }: QRCodeModalProps) {
  const participantsWithQR = participants.filter((p) => p.qr_code);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📱 Generated QR Codes</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-gray-200 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {participantsWithQR.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No QR codes generated yet.</p>
              <p className="text-gray-500">Generate QR codes using the &quot;Generate All QR Codes&quot; button.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participantsWithQR.map((participant) => (
                <div
                  key={participant.id}
                  className="border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center hover:shadow-lg transition"
                >
                  <h3 className="font-bold text-gray-800 mb-3 text-center text-sm">
                    {participant.name}
                  </h3>
                  {participant.qr_code && (
                    <div className="mb-4 p-2 bg-white border-2 border-gray-200 rounded">
                      <Image
                        width={192}
                        height={192}
                        unoptimized
                        src={participant.qr_code}
                        alt={`QR Code for ${participant.name}`}
                        className="w-48 h-48"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (participant.qr_code) {
                        downloadQRCodeAsImage(participant.qr_code, participant.name);
                      }
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded transition"
                  >
                    ⬇️ Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
