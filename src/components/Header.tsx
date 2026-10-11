import React from 'react';
import {
  Shield,
  Box,
  Layers,
  FileCheck,
  ShieldAlert,
  Info
} from 'lucide-react';
import { IndustryProfile, PackageData } from '../types';

interface HeaderProps {
  currentPackage: PackageData;
  packages: PackageData[];
  onSelectPackage: (pkgId: string) => void;
  selectedProfile: IndustryProfile;
  profiles: Record<'FOOD' | 'PHARMA' | 'ECOMMERCE', IndustryProfile>;
  onSelectProfile: (profileId: 'FOOD' | 'PHARMA' | 'ECOMMERCE') => void;
  chainIntact: boolean;
  totalEvidenceCount: number;
  onOpenStatusModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPackage,
  packages,
  onSelectPackage,
  selectedProfile,
  onSelectProfile,
  chainIntact,
  totalEvidenceCount,
  onOpenStatusModal
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Logo & Product Name */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white font-sans">
                Sentinel<span className="text-blue-400">Pack</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                Enterprise IoT & Custody
              </span>
            </div>
          </div>

          {/* Center-Right Controls: Package Selector, Profile Selector, System Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Package Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <span className="text-slate-400 px-2 py-1 text-[11px] font-medium hidden md:flex items-center gap-1">
                <Box className="w-3 h-3 text-slate-400" /> Package:
              </span>
              {packages.map((pkg) => {
                const isSelected = currentPackage.id === pkg.id;
                const hasIncident = pkg.status === 'INCIDENT_DETECTED' || pkg.status === 'TAMPERED';
                return (
                  <button
                    key={pkg.id}
                    id={`btn-select-pkg-${pkg.id}`}
                    onClick={() => onSelectPackage(pkg.id)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-800 text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{pkg.id}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasIncident ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Profile Selector */}
            <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <span className="text-slate-400 px-2 py-1 text-[11px] font-medium flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" /> Profile:
              </span>
              {(['FOOD', 'PHARMA', 'ECOMMERCE'] as const).map((pKey) => {
                const isSelected = selectedProfile.id === pKey;
                return (
                  <button
                    key={pKey}
                    id={`btn-profile-${pKey}`}
                    onClick={() => onSelectProfile(pKey)}
                    className={`px-2 py-1 text-xs font-mono rounded-md transition-colors ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 font-medium border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pKey}
                  </button>
                );
              })}
            </div>

            {/* System Health / Ledger Status */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono ${
                chainIntact
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                  : 'bg-red-950/60 text-red-300 border-red-500/60'
              }`}
              title={chainIntact ? 'Cryptographic ledger intact' : 'Tamper detected on hash chain'}
            >
              {chainIntact ? (
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              )}
              <span className="text-[11px] hidden sm:inline">
                {chainIntact ? `Ledger Valid (${totalEvidenceCount})` : 'Ledger Altered'}
              </span>
            </div>

            {/* Project / Architecture Info */}
            <button
              id="btn-nav-status"
              onClick={onOpenStatusModal}
              title="System Architecture & Roadmap"
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 transition-colors"
            >
              <Info className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
