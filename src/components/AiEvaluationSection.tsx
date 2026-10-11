import React from 'react';
import {
  Cpu,
  BarChart3,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { MLModelEvaluation, MLClassificationResult, EventType } from '../types';
import { EVENT_CLASSES } from '../services/mlEngine';

interface AiEvaluationSectionProps {
  evaluation: MLModelEvaluation;
  latestMlResult: MLClassificationResult;
  onOpenModelModal: () => void;
  onNavigateToSyntheticTesting: () => void;
}

export const AiEvaluationSection: React.FC<AiEvaluationSectionProps> = ({
  evaluation,
  latestMlResult,
  onOpenModelModal,
  onNavigateToSyntheticTesting
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans tracking-tight">
            AI Model Evaluation & Edge Classification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Performance metrics, feature importance rankings, and real-time inference diagnostics for SentinelPack&apos;s Random Forest ensemble.
          </p>
        </div>

        <button
          onClick={onOpenModelModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Full Statistical Report</span>
        </button>
      </div>

      {/* Model Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-center">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Overall Accuracy
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {(evaluation.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            Cross-validated benchmark
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-center">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Macro F1-Score
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
            {evaluation.macroF1.toFixed(3)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            Multi-class balance
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-center">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Macro Precision
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
            {evaluation.macroPrecision.toFixed(3)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            False positive filter
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-center">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Macro Recall
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
            {evaluation.macroRecall.toFixed(3)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            Incident sensitivity
          </div>
        </div>
      </div>

      {/* Live Inference & Feature Importance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live Window Inference State */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Live Stream Inference</h3>
            <span className="text-xs font-mono text-slate-400">15-Sample Window</span>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Current Predicted Class
              </div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {latestMlResult.predictedClass.replace('_', ' ')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Confidence
              </div>
              <div className="text-lg font-bold font-mono text-blue-400 mt-0.5">
                {latestMlResult.confidence}%
              </div>
            </div>
          </div>

          {/* Probabilities distribution */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">Class Probability Distribution:</div>
            {EVENT_CLASSES.map((cls) => {
              const prob = latestMlResult.probabilities[cls] || 0;
              const isMax = latestMlResult.predictedClass === cls;
              return (
                <div key={cls} className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span className={isMax ? 'text-white font-semibold' : 'text-slate-400'}>
                      {cls.replace('_', ' ')}
                    </span>
                    <span className={isMax ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                      {(prob * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isMax ? 'bg-blue-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.max(2, prob * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Importance Rankings */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Feature Importance (Gini Metric)</h3>
            <span className="text-xs font-mono text-slate-400">Decision Trees</span>
          </div>

          <div className="space-y-3">
            {evaluation.featureImportances.map((item) => (
              <div key={item.feature} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-200 font-medium">{item.feature}</span>
                  <span className="text-blue-400 font-bold">
                    {(item.importance * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${item.importance * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">{item.description}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-xs text-slate-400">Want to test against custom datasets?</span>
            <button
              onClick={onNavigateToSyntheticTesting}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>Synthetic Testing Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
