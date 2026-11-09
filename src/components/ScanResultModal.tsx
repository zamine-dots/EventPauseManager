'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { getErrorMessage } from '@/lib/errors';
import { Participant } from '@/db/init';

interface ScanResultModalProps {
  participant: Participant | null;
  onClose: () => void;
  onUpdate: (participant: Participant) => void;
}

export default function ScanResultModal({
  participant,
  onClose,
  onUpdate,
}: ScanResultModalProps) {
  const [loading, setLoading] = useState(false);
  const [foodConfirming, setFoodConfirming] = useState(false);
  const [coffeeConfirming, setCoffeeConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!participant) return null;

  const handleMarkFood = async () => {
    if (participant.food_taken || foodConfirming) return;

    try {
      setLoading(true);
      setFoodConfirming(true);
      setError(null);

      const response = await axios.post<{ participant: Participant }>(`/api/mark-food/${participant.id}`);
      onUpdate(response.data.participant);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to mark food'));
    } finally {
      setLoading(false);
      setFoodConfirming(false);
    }
  };

  const handleMarkCoffee = async () => {
    if (participant.coffee_taken || coffeeConfirming) return;

    try {
      setLoading(true);
      setCoffeeConfirming(true);
      setError(null);

      const response = await axios.post<{ participant: Participant }>(`/api/mark-coffee/${participant.id}`);
      onUpdate(response.data.participant);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to mark coffee'));
    } finally {
      setLoading(false);
      setCoffeeConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
          <div className="text-5xl mb-4">✅ Participant Found!</div>
          <h2 className="text-3xl font-bold">{participant.name}</h2>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-400 rounded-lg">
              <p className="text-red-700 font-semibold">❌ {error}</p>
            </div>
          )}

          {/* Food Button */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">🍽️ Food Order</p>
            <p className="text-lg font-semibold text-gray-800 mb-4">
              {participant.food_order}
            </p>
            <button
              onClick={handleMarkFood}
              disabled={loading || participant.food_taken}
              className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
                participant.food_taken
                  ? 'bg-red-500 cursor-not-allowed hover:bg-red-600'
                  : foodConfirming
                  ? 'bg-yellow-500 hover:bg-yellow-600 scale-105'
                  : 'bg-green-500 hover:bg-green-600 active:scale-95'
              }`}
            >
              {foodConfirming ? (
                <>⏳ Confirming...</>
              ) : participant.food_taken ? (
                <>❌ Already Taken</>
              ) : (
                <>✅ Mark Food Taken</>
              )}
            </button>
          </div>

          {/* Coffee Button */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">☕ Coffee Order</p>
            <p className="text-lg font-semibold text-gray-800 mb-4">
              {participant.coffee_order}
            </p>
            <button
              onClick={handleMarkCoffee}
              disabled={loading || participant.coffee_taken}
              className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
                participant.coffee_taken
                  ? 'bg-red-500 cursor-not-allowed hover:bg-red-600'
                  : coffeeConfirming
                  ? 'bg-yellow-500 hover:bg-yellow-600 scale-105'
                  : 'bg-green-500 hover:bg-green-600 active:scale-95'
              }`}
            >
              {coffeeConfirming ? (
                <>⏳ Confirming...</>
              ) : participant.coffee_taken ? (
                <>❌ Already Taken</>
              ) : (
                <>✅ Mark Coffee Taken</>
              )}
            </button>
          </div>

          {/* Status Summary */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <p className="text-sm text-gray-500 mb-3 text-center font-semibold">
              Current Status
            </p>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-4xl mb-2">{participant.food_taken ? '✅' : '❌'}</div>
                <p className="text-xs text-gray-600 font-semibold">Food</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">{participant.coffee_taken ? '✅' : '❌'}</div>
                <p className="text-xs text-gray-600 font-semibold">Coffee</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
