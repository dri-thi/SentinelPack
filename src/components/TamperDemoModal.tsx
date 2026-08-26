import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  RotateCcw,
  CheckCircle,
  X,
  AlertOctagon,
  ArrowRight,
  Flame,
  Activity,
  Sliders,
  FileCheck
} from 'lucide-react';
import { EvidenceRecord, VerificationResult } from '../types';

interface TamperDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: EvidenceRecord[];
  verificationResult: VerificationResult;
  onTamperRecord: (
    recordId: string,
    field: 'temperature' | 'accelMag' | 'timestamp' | 'tamperState',
    newValue: any
  ) => void;
  onRestoreChain: () => void;
}

export const TamperDemoModal: React.FC<TamperDemoModalProps> = ({
  isOpen,
  onClose,
  records,
  verificationResult,
  onTamperRecord,
  onRestoreChain
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    records.length > 0 ? records[records.length - 1].recordId : ''
  );
  const [selectedField, setSelectedField] = useState<'temperature' | 'accelMag' | 'timestamp' | 'tamperState'>(
    'temperature'
  );
  const [tamperedValue, setTamperedValue] = useState<string>('18.0');

  if (!isOpen) return null;

  const currentRecord = records.find((r) => r.recordId === selectedRecordId) || records[0];

  const handleExecuteTamper = () => {
    if (!currentRecord) return;
    let val: any = tamperedValue;
    if (selectedField === 'temperature' || selectedField === 'accelMag') {
      val = parseFloat(tamperedValue) || 0;
    } else if (selectedField === 'tamperState') {
      val = tamperedValue === 'true';
    }
    onTamperRecord(currentRecord.recordId, selectedField, val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] relative backdrop-blur-2xl">
        {/* Close Button */}
        <button
          id="btn-close-tamper-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-800/60">
          <div className="p-2.5 rounded-xl bg-red-600/15 text-red-400 border border-red-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
              <span>Cryptographic Evidence Tamper Demonstration</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-red-600/10 text-red-400 border border-red-500/30 font-mono font-bold">
                Live Attack Simulation
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Demonstrating mathematical immutability: Any retroactive modification breaks the SHA-256 block hash.
            </p>
          </div>
        </div>

        {/* Live Integrity Status Banner */}
        <div
          className={`p-4 rounded-xl border mb-5 transition-all backdrop-blur-md ${
            verificationResult.chainIntact
              ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              : 'bg-red-950/60 border-red-500/70 text-red-100 ring-2 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {verificationResult.chainIntact ? (
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-7 h-7 text-red-400 animate-bounce" />
              )}
              <div>
                <div className="text-sm font-bold font-mono">
                  {verificationResult.chainIntact
                    ? 'CHAIN STATUS: ✓ ALL RECORDS VERIFIED & INTACT'
                    : '❌ INTEGRITY VERIFICATION FAILED'}
                </div>
                <div className="text-xs font-mono opacity-90 mt-0.5">
                  {verificationResult.chainIntact
                    ? `Total: ${verificationResult.totalRecords} | Verified: ${verificationResult.verifiedRecords} | Failed: 0`
                    : `Corrupted Record: ${verificationResult.corruptedRecordId} | Recalculated Hash Mismatch Detected!`}
                </div>
              </div>
            </div>

            {!verificationResult.chainIntact && (
              <button
                id="btn-restore-chain"
                onClick={onRestoreChain}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Chain</span>
              </button>
            )}
          </div>

          {!verificationResult.chainIntact && (
            <div className="mt-3.5 pt-3 border-t border-red-800/60 text-xs font-mono space-y-1.5">
              <div className="text-amber-300 font-bold">Diagnostic Trace:</div>
              <div className="p-3 bg-black/60 rounded-xl border border-red-500/40 text-[11px] space-y-1">
                <div>
                  <span className="text-slate-400">Record ID: </span>
                  <span className="text-white font-bold">{verificationResult.corruptedRecordId}</span>
                </div>
                <div>
                  <span className="text-slate-400">Expected Stored Hash: </span>
                  <span className="text-emerald-400 break-all">{verificationResult.expectedHash}</span>
                </div>
                <div>
                  <span className="text-slate-400">Calculated Hash (Tampered): </span>
                  <span className="text-red-400 font-bold break-all">{verificationResult.recalculatedHash}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status: </span>
                  <span className="text-red-300 font-bold">CRITICAL EVIDENCE TAMPER DETECTED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Tamper Execution Form */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 mb-4 backdrop-blur-md">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Select Record & Inject Malicious Mutation</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {/* Record Selector */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Target Record ID
              </label>
              <select
                id="select-tamper-record"
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              >
                {records.map((r) => (
                  <option key={r.recordId} value={r.recordId}>
                    {r.recordId} ({r.checkpointName} - {r.eventType})
                  </option>
                ))}
              </select>
            </div>

            {/* Field to Alter */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Field to Modify
              </label>
              <select
                id="select-tamper-field"
                value={selectedField}
                onChange={(e) => {
                  const f = e.target.value as any;
                  setSelectedField(f);
                  if (f === 'temperature') setTamperedValue('18.0');
                  else if (f === 'accelMag') setTamperedValue('1.02');
                  else if (f === 'timestamp') setTamperedValue('09:15:00 AM');
                  else if (f === 'tamperState') setTamperedValue('false');
                }}
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              >
                <option value="temperature">Temperature (°C)</option>
                <option value="accelMag">Acceleration Magnitude (g)</option>
                <option value="timestamp">Timestamp (ISO)</option>
                <option value="tamperState">Tamper Seal Flag</option>
              </select>
            </div>

            {/* Tampered Value Input */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Altered Value (Tampered)
              </label>
              <input
                id="input-tamper-value"
                type="text"
                value={tamperedValue}
                onChange={(e) => setTamperedValue(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                placeholder="e.g. 18.0"
              />
            </div>
          </div>

          {/* Current vs Proposed Values */}
          {currentRecord && (
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/60 text-xs font-mono mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Original Valid:</span>
                <span className="text-emerald-400 font-bold">
                  {selectedField === 'temperature'
                    ? `${currentRecord.sensorSnapshot.temperature.toFixed(1)}°C`
                    : selectedField === 'accelMag'
                    ? `${currentRecord.sensorSnapshot.accelMag.toFixed(2)}g`
                    : selectedField === 'tamperState'
                    ? String(currentRecord.sensorSnapshot.tamperState)
                    : currentRecord.timestamp}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Tampered Value:</span>
                <span className="text-red-400 font-bold">{tamperedValue}</span>
              </div>
            </div>
          )}

          {/* Execute Button */}
          <button
            id="btn-execute-tamper-attack"
            onClick={handleExecuteTamper}
            className="w-full py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Execute Malicious Record Modification & Verify Hash</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500 text-center">
          SentinelPack Cryptographic Evidence Trail • SHA-256 Block Chaining & Edge HMAC Verification
        </div>
      </div>
    </div>
  );
};
