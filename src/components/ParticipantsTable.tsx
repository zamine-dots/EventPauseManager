'use client';

import React from 'react';
import { Participant } from '@/db/init';
import axios from 'axios';

interface ParticipantsTableProps {
  participants: Participant[];
  onEdit: (participant: Participant) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  searchTerm: string;
}

export default function ParticipantsTable({
  participants,
  onEdit,
  onDelete,
  onRefresh,
  searchTerm,
}: ParticipantsTableProps) {
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.food_order.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.coffee_order.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this participant?')) return;

    try {
      setIsDeleting(id);
      await axios.delete(`/api/participant/${id}`);
      onDelete(id);
    } catch (error) {
      alert('Failed to delete participant');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Food</th>
            <th className="px-4 py-3 text-left font-semibold">Coffee</th>
            <th className="px-4 py-3 text-center font-semibold">Food Status</th>
            <th className="px-4 py-3 text-center font-semibold">Coffee Status</th>
            <th className="px-4 py-3 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {filteredParticipants.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                {participants.length === 0
                  ? 'No participants yet. Add one to get started!'
                  : 'No participants match your search.'}
              </td>
            </tr>
          ) : (
            filteredParticipants.map((participant) => (
              <tr
                key={participant.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-gray-800">
                  {participant.name}
                </td>
                <td className="px-4 py-3 text-gray-700">{participant.food_order}</td>
                <td className="px-4 py-3 text-gray-700">{participant.coffee_order}</td>
                <td className="px-4 py-3 text-center">
                  {participant.food_taken ? (
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      ✅ Taken
                    </span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                      ❌ Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {participant.coffee_taken ? (
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      ✅ Taken
                    </span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                      ❌ Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onEdit(participant)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold text-xs transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(participant.id)}
                      disabled={isDeleting === participant.id}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded font-semibold text-xs transition disabled:opacity-50"
                    >
                      {isDeleting === participant.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {filteredParticipants.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          Showing {filteredParticipants.length} of {participants.length} participants
        </div>
      )}
    </div>
  );
}
