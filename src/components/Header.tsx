import React from 'react';
import {
  Shield,
  Radio,
  Cpu,
  Box,
  Layers,
  FileCheck,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { IndustryProfile, PackageData, RiskLevel } from '../types';

interface HeaderProps {
  currentPackage: PackageData;
  packages: PackageData[];
  onSelectPackage: (pkgId: string) => void;
  selectedProfile: IndustryProfile;
  profiles: Record<'FOOD' | 'PHARMA' | 'ECOMMERCE', IndustryProfile>;
  onSelectProfile: (profileId: 'FOOD' | 'PHARMA' | 'ECOMMERCE') => void;
  onOpenModelModal: () => void;
  onOpenReplayModal: () => void;
  onOpenStatusModal: () => void;
  onOpenTamperModal: () => void;
  chainIntact: boolean;
  totalEvidenceCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPackage,
  packages,
  onSelectPackage,
  selectedProfile,
  profiles,
  onSelectProfile,
  onOpenModelModal,
  onOpenReplayModal,
  onOpenStatusModal,
  onOpenTamperModal,
  chainIntact,
  totalEvidenceCount
}) => {
  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <header className="border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">
          {/* Logo and Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400/40">
              <Shield className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-sans">
                  SENTINEL<span className="text-blue-500">PACK</span>
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-blue-600/10 text-blue-400 border border-blue-500/40 font-bold">
                  v2.0.4-BETA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                Intelligent Smart Packaging & Digital Chain of Custody
              </p>
            </div>
          </div>

          {/* Quick Package Selector & Profile Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Package Selector */}
            <div className="flex items-center bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-slate-800/60">
              <span className="text-[10px] font-mono text-slate-400 px-2 flex items-center gap-1">
                <Box className="w-3.5 h-3.5 text-blue-400" /> PKG:
              </span>
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  id={`btn-select-pkg-${pkg.id}`}
                  onClick={() => onSelectPackage(pkg.id)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                    currentPackage.id === pkg.id
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50 font-bold shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span>{pkg.id}</span>
                  {pkg.status === 'INCIDENT_DETECTED' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Profile Dropdown / Selector */}
            <div className="flex items-center bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-slate-800/60">
              <span className="text-[10px] font-mono text-slate-400 px-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> PROFILE:
              </span>
              {(['FOOD', 'PHARMA', 'ECOMMERCE'] as const).map((pKey) => (
                <button
                  key={pKey}
                  id={`btn-profile-${pKey}`}
                  onClick={() => onSelectProfile(pKey)}
                  className={`px-2 py-1 text-xs font-mono rounded-lg transition-all ${
                    selectedProfile.id === pKey
                      ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/50 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {pKey}
                </button>
              ))}
            </div>

            {/* Chain Integrity Badge */}
            <button
              id="btn-header-verify-chain"
              onClick={onOpenTamperModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono backdrop-blur-md transition-all ${
                chainIntact
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/50'
                  : 'bg-red-500/15 text-red-400 border-red-500/40 hover:bg-red-900/60 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.25)]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>
                {chainIntact ? `CHAIN: INTACT (${totalEvidenceCount})` : '❌ CHAIN TAMPERED'}
              </span>
            </button>
          </div>

          {/* Action Modals Nav */}
          <div className="flex items-center gap-2">
            <button
              id="btn-nav-replay"
              onClick={onOpenReplayModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/40 hover:bg-slate-800/70 text-slate-200 rounded-xl text-xs font-medium border border-slate-700/50 backdrop-blur-md transition-all hover:border-slate-600"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Incident Replay</span>
            </button>

            <button
              id="btn-nav-ml-metrics"
              onClick={onOpenModelModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/40 hover:bg-slate-800/70 text-slate-200 rounded-xl text-xs font-medium border border-slate-700/50 backdrop-blur-md transition-all hover:border-slate-600"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Evaluation</span>
            </button>

            <button
              id="btn-nav-status"
              onClick={onOpenStatusModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/40 hover:bg-slate-800/70 text-slate-200 rounded-xl text-xs font-medium border border-slate-700/50 backdrop-blur-md transition-all hover:border-slate-600"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Round 2 Status</span>
            </button>
          </div>
        </div>

        {/* Subheader: Active Asset Quick Bar */}
        <div className="py-2 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-500 text-[11px]">CURRENT ASSET:</span>
              <span className="text-blue-400 font-bold">{currentPackage.id}</span>
              <span className="text-slate-500 text-[11px]">({currentPackage.sku})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">ROUTE:</span>
              <span className="text-slate-300 font-mono">{currentPackage.origin}</span>
              <span className="text-slate-600">→</span>
              <span className="text-slate-300 font-mono">{currentPackage.destination}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">CHECKPOINT:</span>
              <span className="text-blue-300 font-mono font-medium">{currentPackage.currentCheckpoint}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-mono text-[11px]">STATUS:</span>
              <span className="px-2.5 py-0.5 rounded-md font-mono font-semibold text-[11px] bg-slate-950/60 border border-slate-800/80 text-slate-200">
                {currentPackage.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-mono text-[11px]">INCIDENT STATE:</span>
              <span
                className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[11px] border ${getRiskBadge(
                  currentPackage.riskLevel
                )}`}
              >
                {currentPackage.riskLevel === 'CRITICAL' || currentPackage.status === 'INCIDENT_DETECTED'
                  ? `INCIDENT: ${currentPackage.riskLevel}`
                  : `NOMINAL (${currentPackage.riskLevel})`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
