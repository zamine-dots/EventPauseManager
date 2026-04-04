'use client';

import React from 'react';
import { Participant } from '@/db/init';
import axios from 'axios';

interface ParticipantFormProps {
  participant?: Participant | null;
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ParticipantForm({
  participant,
  onSave,
  onCancel,
  isLoading = false,
}: ParticipantFormProps) {
  const [formData, setFormData] = React.useState({
    name: participant?.name || '',
    food_order: participant?.food_order || '',
    coffee_order: participant?.coffee_order || '',
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.food_order || !formData.coffee_order) {
      setError('All fields are required');
      return;
    }

    try {
      setIsSaving(true);
      if (participant?.id) {
        // Update existing
        await axios.put(`/api/participant/${participant.id}`, formData);
      } else {
        // Create new
        await axios.post('/api/participant', formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save participant');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {participant?.id ? '✏️ Edit Participant' : '➕ Add New Participant'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
            disabled={isLoading || isSaving}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🍽️ Food Order *
          </label>
          <input
            type="text"
            name="food_order"
            value={formData.food_order}
            onChange={handleChange}
            placeholder="e.g., Pasta, Veggie Burger"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
            disabled={isLoading || isSaving}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ☕ Coffee Order *
          </label>
          <input
            type="text"
            name="coffee_order"
            value={formData.coffee_order}
            onChange={handleChange}
            placeholder="e.g., Espresso, Cappuccino"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
            disabled={isLoading || isSaving}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-400 rounded-lg">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || isSaving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : participant?.id ? 'Update' : 'Add'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading || isSaving}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
