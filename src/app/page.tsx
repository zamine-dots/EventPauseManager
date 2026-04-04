'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Participant } from '@/db/init';
import ParticipantForm from '@/components/ParticipantForm';
import ParticipantsTable from '@/components/ParticipantsTable';
import QRCodeModal from '@/components/QRCodeModal';
import QRScanner from '@/components/QRScanner';
import ScanResultModal from '@/components/ScanResultModal';
import { generateQRCodeBase64, getScanUrl } from '@/lib/qrcode';

export default function DashboardPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedParticipant, setScannedParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/participants');
      setParticipants(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = () => {
    setEditingParticipant(null);
    setShowForm(true);
  };

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingParticipant(null);
    fetchParticipants();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingParticipant(null);
  };

  const handleDeleteParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleGenerateAllQRCodes = async () => {
    if (isGeneratingQR) return;

    try {
      setIsGeneratingQR(true);
      const updatedParticipants = [];

      for (const participant of participants) {
        const qrText = getScanUrl(participant.id);
        const qrCode = await generateQRCodeBase64(qrText);
        const updated = await axios.put(`/api/participant/${participant.id}`, {
          qr_code: qrCode,
        });
        updatedParticipants.push(updated.data);
      }

      setParticipants(updatedParticipants);
      setShowQRModal(true);
      alert('QR codes generated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate QR codes');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleResetStatus = async () => {
    if (!confirm('Reset all food and coffee statuses? This cannot be undone.')) return;

    try {
      await axios.post('/api/reset');
      fetchParticipants();
      alert('All statuses reset successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reset statuses');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Food Order', 'Coffee Order', 'Food Taken', 'Coffee Taken'];
    const rows = participants.map((p) => [
      p.id,
      p.name,
      p.food_order,
      p.coffee_order,
      p.food_taken ? 'Yes' : 'No',
      p.coffee_taken ? 'Yes' : 'No',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `participants-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleScanSuccess = (participant: Participant) => {
    setScannedParticipant(participant);
    setShowScanner(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎫 Event Distribution Manager
          </h1>
          <p className="text-gray-600">Manage food and coffee distribution with QR codes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Participants</p>
            <p className="text-3xl font-bold text-gray-800">{participants.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Food Distributed</p>
            <p className="text-3xl font-bold text-gray-800">
              {participants.filter((p) => p.food_taken).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Coffee Distributed</p>
            <p className="text-3xl font-bold text-gray-800">
              {participants.filter((p) => p.coffee_taken).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Completed (Both)</p>
            <p className="text-3xl font-bold text-gray-800">
              {participants.filter((p) => p.food_taken && p.coffee_taken).length}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={handleAddParticipant}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            ➕ Add Participant
          </button>
          <button
            onClick={() => setShowScanner(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            📱 Scan QR Code
          </button>
          <button
            onClick={handleGenerateAllQRCodes}
            disabled={participants.length === 0 || isGeneratingQR}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {isGeneratingQR ? '⏳ Generating...' : '📱 Generate QR Codes'}
          </button>
          <button
            onClick={() => setShowQRModal(true)}
            disabled={participants.filter((p) => p.qr_code).length === 0}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            👁️ View QR Codes
          </button>
          <button
            onClick={handleExportCSV}
            disabled={participants.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            📥 Export CSV
          </button>
          <button
            onClick={handleResetStatus}
            disabled={participants.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            🔄 Reset Status
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          {showForm && (
            <div className="lg:col-span-1">
              <ParticipantForm
                participant={editingParticipant}
                onSave={handleFormSave}
                onCancel={handleFormCancel}
                isLoading={loading}
              />
            </div>
          )}

          {/* Participants Table Section */}
          <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6">
                <p className="text-red-700 font-semibold">❌ {error}</p>
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search by name, food, or coffee order..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Table */}
                <ParticipantsTable
                  participants={participants}
                  onEdit={handleEditParticipant}
                  onDelete={handleDeleteParticipant}
                  onRefresh={fetchParticipants}
                  searchTerm={searchTerm}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <QRCodeModal
          participants={participants}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Scan Result Modal */}
      {scannedParticipant && (
        <ScanResultModal
          participant={scannedParticipant}
          onClose={() => setScannedParticipant(null)}
          onUpdate={fetchParticipants}
        />
      )}
    </main>
  );
}
