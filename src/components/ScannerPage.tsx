'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Participant } from '@/db/init';

interface ScannerPageProps {
  participantId: string;
}

export default function ScannerPage({ participantId }: ScannerPageProps) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foodSuccess, setFoodSuccess] = useState(false);
  const [coffeeSuccess, setCoffeeSuccess] = useState(false);
  const [disableFoodBtn, setDisableFoodBtn] = useState(false);
  const [disableCoffeeBtn, setDisableCoffeeBtn] = useState(false);

  React.useEffect(() => {
    fetchParticipant();
  }, [participantId]);

  const fetchParticipant = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/participant/${participantId}`);
      setParticipant(response.data);
      setDisableFoodBtn(response.data.food_taken);
      setDisableCoffeeBtn(response.data.coffee_taken);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load participant');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFood = async () => {
    if (!participant || disableFoodBtn) return;

    try {
      setDisableFoodBtn(true);
      const response = await axios.post(`/api/mark-food/${participantId}`);
      setParticipant(response.data.participant);
      setFoodSuccess(true);
      setTimeout(() => setFoodSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark food as taken');
      setDisableFoodBtn(false);
    }
  };

  const handleMarkCoffee = async () => {
    if (!participant || disableCoffeeBtn) return;

    try {
      setDisableCoffeeBtn(true);
      const response = await axios.post(`/api/mark-coffee/${participantId}`);
      setParticipant(response.data.participant);
      setCoffeeSuccess(true);
      setTimeout(() => setCoffeeSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark coffee as taken');
      setDisableCoffeeBtn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading participant data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchParticipant}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Participant Not Found</h1>
          <p className="text-gray-600">The QR code is invalid or the participant does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            🎫 Distribution
          </h1>
          <div className="w-full h-1 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full"></div>
        </div>

        {/* Participant Info */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border-2 border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Participant Name</p>
          <p className="text-3xl font-bold text-gray-800 mb-6">{participant.name}</p>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">🍽️ Food Order</p>
              <p className="text-lg font-semibold text-gray-700">{participant.food_order}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">☕ Coffee Order</p>
              <p className="text-lg font-semibold text-gray-700">{participant.coffee_order}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Food Button */}
          <button
            onClick={handleMarkFood}
            disabled={disableFoodBtn}
            className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all duration-300 transform ${
              disableFoodBtn
                ? 'bg-green-500 hover:bg-green-600 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
            }`}
          >
            {disableFoodBtn ? '✅ Food Taken' : '🍽️ Mark Food Taken'}
          </button>

          {/* Coffee Button */}
          <button
            onClick={handleMarkCoffee}
            disabled={disableCoffeeBtn}
            className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all duration-300 transform ${
              disableCoffeeBtn
                ? 'bg-green-500 hover:bg-green-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
            }`}
          >
            {disableCoffeeBtn ? '✅ Coffee Taken' : '☕ Mark Coffee Taken'}
          </button>
        </div>

        {/* Success Messages */}
        {foodSuccess && (
          <div className="mt-4 p-4 bg-green-50 border-2 border-green-400 rounded-lg">
            <p className="text-green-700 font-semibold text-center">✅ Food marked as taken!</p>
          </div>
        )}

        {coffeeSuccess && (
          <div className="mt-4 p-4 bg-green-50 border-2 border-green-400 rounded-lg">
            <p className="text-green-700 font-semibold text-center">✅ Coffee marked as taken!</p>
          </div>
        )}

        {/* Status Summary */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 mb-3 text-center font-semibold">Status</p>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className={`text-4xl mb-2 ${participant.food_taken ? '✅' : '❌'}`}></div>
              <p className="text-xs text-gray-600">Food</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl mb-2 ${participant.coffee_taken ? '✅' : '❌'}`}></div>
              <p className="text-xs text-gray-600">Coffee</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <a
            href="/"
            className="block w-full text-center py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
