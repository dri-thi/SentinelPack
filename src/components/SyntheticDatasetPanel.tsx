import React, { useState, useMemo } from 'react';
import {
  Database,
  Download,
  Play,
  CheckCircle,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Sliders,
  FileSpreadsheet,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import {
  SyntheticSensorRecord,
  SyntheticScenarioLabel,
  SYNTHETIC_SCENARIO_CLASSES,
  SyntheticDatasetEvaluationReport,
  generateSyntheticDatasetModule,
  splitDataset,
  evaluateExistingClassifierOnTestSet,
  downloadSyntheticDatasetCSV
} from '../services/syntheticDatasetService';

interface SyntheticDatasetPanelProps {
  // Optional initial records count or controls
}

export const SyntheticDatasetPanel: React.FC<SyntheticDatasetPanelProps> = () => {
  // Generation & Seed State
  const [recordCount, setRecordCount] = useState<number>(1000);
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Stored Synthetic Dataset
  const [dataset, setDataset] = useState<SyntheticSensorRecord[]>(() =>
    generateSyntheticDatasetModule(1000, 42)
  );

  // Evaluation Report State (initially evaluated on held-out test split of the 1000 generated records)
  const [evaluationReport, setEvaluationReport] = useState<SyntheticDatasetEvaluationReport | null>(
    () => {
      const initialData = generateSyntheticDatasetModule(1000, 42);
      const { train, test } = splitDataset(initialData, 0.3, 42);
      return evaluateExistingClassifierOnTestSet(test, train.length, 42);
    }
  );

  // Preview Table Filters & Pagination
  const [previewFilter, setPreviewFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDocDetails, setShowDocDetails] = useState<boolean>(false);
  const [showMisclassified, setShowMisclassified] = useState<boolean>(true);
  const pageSize = 8;

  // Handle Generate Dataset
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newRecords = generateSyntheticDatasetModule(recordCount, randomSeed);
      setDataset(newRecords);
      // Automatically split and run evaluation on the fresh held-out test data
      const { train, test } = splitDataset(newRecords, 0.3, randomSeed);
      const report = evaluateExistingClassifierOnTestSet(test, train.length, randomSeed);
      setEvaluationReport(report);
      setCurrentPage(1);
      setIsGenerating(false);
    }, 250);
  };

  // Handle Run Evaluation (using existing classifier on the current held-out test set)
  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const { train, test } = splitDataset(dataset, 0.3, randomSeed);
      const report = evaluateExistingClassifierOnTestSet(test, train.length, randomSeed);
      setEvaluationReport(report);
      setIsEvaluating(false);
    }, 200);
  };

  // Handle Download CSV
  const handleDownloadCSV = () => {
    downloadSyntheticDatasetCSV(
      dataset,
      `sentinelpack_synthetic_dataset_N${dataset.length}_seed${randomSeed}.csv`
    );
  };

  // Filtered Records for Preview
  const filteredRecords = useMemo(() => {
    return dataset.filter((r) => {
      const matchesFilter =
        previewFilter === 'ALL' || r.scenario_label === previewFilter;
      const matchesSearch =
        !searchQuery ||
        r.record_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.package_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.scenario_label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [dataset, previewFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Distribution Counts across all 5 classes
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Normal transit': 0,
      'Package impact/drop': 0,
      'Tampering': 0,
      'Temperature breach': 0,
      'Abnormal tilt/orientation': 0
    };
    dataset.forEach((r) => {
      if (counts[r.scenario_label] !== undefined) {
        counts[r.scenario_label]++;
      }
    });
    return counts;
  }, [dataset]);

  const getScenarioBadge = (scenario: SyntheticScenarioLabel) => {
    switch (scenario) {
      case 'Normal transit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <CheckCircle className="w-3 h-3" /> Normal transit
          </span>
        );
      case 'Package impact/drop':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-amber-950/60 text-amber-400 border border-amber-800/60">
            <AlertTriangle className="w-3 h-3" /> Impact/Drop
          </span>
        );
      case 'Tampering':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-red-950/60 text-red-400 border border-red-800/60">
            <ShieldAlert className="w-3 h-3" /> Tampering
          </span>
        );
      case 'Temperature breach':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-orange-950/60 text-orange-400 border border-orange-800/60">
            <Flame className="w-3 h-3" /> Temp breach
          </span>
        );
      case 'Abnormal tilt/orientation':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-purple-950/60 text-purple-400 border border-purple-800/60">
            <Sliders className="w-3 h-3" /> Abnormal tilt
          </span>
        );
    }
  };

  return (
    <section
      id="synthetic-dataset-evaluation-section"
      className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6"
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header & Section Title */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-sans">
                Synthetic Dataset & Evaluation
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-blue-600/15 text-blue-300 border border-blue-500/30 font-mono font-bold">
                TESTING MODULE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/60 font-mono font-bold">
                SYNTHETIC ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              1,000+ realistic simulated sensor records evaluated against the existing SentinelPack Decision-Forest classifier on held-out test data.
            </p>
          </div>
        </div>

        {/* Action Controls Deck */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/60 rounded-xl px-3 py-1.5 backdrop-blur-md text-xs font-mono">
            <span className="text-slate-500">SEED:</span>
            <input
              type="number"
              value={randomSeed}
              onChange={(e) => setRandomSeed(Number(e.target.value) || 0)}
              className="w-14 bg-slate-900 border border-slate-700/60 rounded px-1.5 py-0.5 text-center text-blue-400 focus:outline-none focus:border-blue-500"
              title="Deterministic seed for reproducible generation"
            />
            <span className="text-slate-500 ml-1">RECORDS:</span>
            <select
              value={recordCount}
              onChange={(e) => setRecordCount(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700/60 rounded px-1.5 py-0.5 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value={1000}>1,000</option>
              <option value={1500}>1,500</option>
              <option value={2000}>2,000</option>
            </select>
          </div>

          <button
            id="btn-generate-dataset"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Generate Dataset'}</span>
          </button>

          <button
            id="btn-run-evaluation"
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-pulse' : ''}`} />
            <span>{isEvaluating ? 'Evaluating...' : 'Run Evaluation'}</span>
          </button>

          <button
            id="btn-download-csv"
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 rounded-xl text-xs font-mono font-bold border border-emerald-500/30 backdrop-blur-md transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Notice Banner: Technical Honesty & Hardware Status */}
      <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-300 font-mono">Explicitly Synthetic Sensor Telemetry:</strong> All 3-axis accelerometer readings, GPS coordinates, tilt angles, and thermal records are simulated for algorithm validation and stress-testing. Physical sensor hardware (ESP32-S3 / MPU6050 / NEO-6M) integration will occur in next semester&apos;s hardware phase.
          </p>
        </div>
        <button
          onClick={() => setShowDocDetails(!showDocDetails)}
          className="text-[11px] font-mono text-blue-400 hover:text-blue-300 shrink-0 underline flex items-center gap-1"
        >
          <span>{showDocDetails ? 'Hide Assumptions & Thresholds' : 'View Assumptions & Thresholds'}</span>
          {showDocDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Documented Assumptions & Thresholds (Collapsible) */}
      {showDocDetails && (
        <div className="p-4 bg-slate-950/90 border border-blue-500/30 rounded-xl text-xs space-y-3 font-mono text-slate-300 animate-in fade-in duration-200">
          <div className="text-blue-400 font-bold flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>Documented Simulation Assumptions & Physics Thresholds:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px]">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <div className="text-emerald-400 font-bold mb-1">1. Normal Transit</div>
              <p className="text-slate-400">
                • Accel: ~1.0g baseline (0.95g-1.12g), minor road vibration.<br />
                • Tilt: 0.5° - 8.0° nominal.<br />
                • Temp: 2.0°C - 6.0°C cold-chain envelope.<br />
                • Overlap: 4% transient road bumps (1.8g - 2.2g) without tilt.
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <div className="text-amber-400 font-bold mb-1">2. Package Impact / Drop</div>
              <p className="text-slate-400">
                • Accel: 2.5g to 6.5g shock spike.<br />
                • Tilt: 15° to 75° angular tumble.<br />
                • Overlap: 6% borderline drops (2.1g - 2.4g) testing boundary sensitivity.
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <div className="text-red-400 font-bold mb-1">3. Tampering</div>
              <p className="text-slate-400">
                • Tamper Switch: Triggered (tamper_detected = TRUE).<br />
                • Temp: Box unsealed into ambient air (12°C - 22°C).<br />
                • Accel: Low handling motion (1.0g - 1.3g).
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <div className="text-orange-400 font-bold mb-1">4. Temperature Breach</div>
              <p className="text-slate-400">
                • Temp: &gt; 8.5°C up to 28°C (refrigeration failure).<br />
                • Accel: Normal transit physics (~1.0g).<br />
                • Overlap: 5% borderline readings (7.6°C - 8.2°C).
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <div className="text-purple-400 font-bold mb-1">5. Abnormal Tilt / Orientation</div>
              <p className="text-slate-400">
                • Tilt: 42° to 90° sustained orientation breach.<br />
                • Accel: Moderate vehicle rumble without impact spike.<br />
                • Overlap: 7% near-threshold values (38° - 44°).
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <div className="text-blue-400 font-bold mb-1">Anti-Leakage Protocol</div>
              <p className="text-slate-400">
                • Train/Test Split: 70% Train / 30% Test stratified split.<br />
                • Zero duplicate records across sets.<br />
                • Evaluation executed strictly on held-out test data (N={evaluationReport?.testCount || 300}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Class Distribution Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SYNTHETIC_SCENARIO_CLASSES.map((cls) => (
          <div
            key={cls}
            className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 backdrop-blur-md flex flex-col justify-between"
          >
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider truncate">
              {cls}
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-bold font-mono text-white">
                {classCounts[cls] || 0}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {((((classCounts[cls] || 0) / dataset.length) * 100) || 0).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* EVALUATION RESULTS & METRICS DECK */}
      {evaluationReport && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold font-sans text-white uppercase tracking-wider">
                Held-Out Test Set Evaluation Results (Existing Classifier)
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Test Samples: <span className="text-indigo-300 font-bold">{evaluationReport.testCount}</span> / Total: <span className="text-slate-300">{evaluationReport.totalRecords}</span>
            </div>
          </div>

          {/* Primary Metric Scorecards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 text-center backdrop-blur-md">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                ACCURACY
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {(evaluationReport.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                {Math.round(evaluationReport.accuracy * evaluationReport.testCount)} / {evaluationReport.testCount} correct
              </div>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 text-center backdrop-blur-md">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                MACRO F1-SCORE
              </div>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
                {evaluationReport.macroF1.toFixed(3)}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                Harmonic mean across 5 classes
              </div>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 text-center backdrop-blur-md">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                MACRO PRECISION
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                {evaluationReport.macroPrecision.toFixed(3)}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                Average positive predictive value
              </div>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 text-center backdrop-blur-md">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                MACRO RECALL
              </div>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                {evaluationReport.macroRecall.toFixed(3)}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                Average sensitivity / hit-rate
              </div>
            </div>
          </div>

          {/* Per-Class Detailed Performance Table */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl overflow-x-auto backdrop-blur-md">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4">Event Class</th>
                  <th className="py-2.5 px-4 text-right">Precision</th>
                  <th className="py-2.5 px-4 text-right">Recall</th>
                  <th className="py-2.5 px-4 text-right">F1-Score</th>
                  <th className="py-2.5 px-4 text-right">Support (Test N)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {SYNTHETIC_SCENARIO_CLASSES.map((cls) => {
                  const m = evaluationReport.classMetrics[cls];
                  return (
                    <tr key={cls} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-200">
                        {getScenarioBadge(cls)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-indigo-300">
                        {m ? m.precision.toFixed(3) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right text-purple-300">
                        {m ? m.recall.toFixed(3) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right text-emerald-300 font-bold">
                        {m ? m.f1Score.toFixed(3) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-400">
                        {m ? m.support : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Confusion Matrix & Misclassifications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Confusion Matrix */}
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                  5x5 Confusion Matrix (Actual vs Predicted)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Rows: Actual • Cols: Predicted
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-center">
                  <thead>
                    <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-800">
                      <th className="p-1.5 text-left text-slate-400">Actual \ Pred</th>
                      <th className="p-1.5">Norm</th>
                      <th className="p-1.5">Impact</th>
                      <th className="p-1.5">Tamp</th>
                      <th className="p-1.5">Temp</th>
                      <th className="p-1.5">Tilt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {SYNTHETIC_SCENARIO_CLASSES.map((actual) => {
                      return (
                        <tr key={actual}>
                          <td className="p-1.5 text-left text-slate-300 text-[11px] truncate max-w-[120px]">
                            {actual}
                          </td>
                          {SYNTHETIC_SCENARIO_CLASSES.map((pred) => {
                            const cell = evaluationReport.confusionMatrix.find(
                              (c) => c.actual === actual && c.predicted === pred
                            );
                            const count = cell ? cell.count : 0;
                            const isDiagonal = actual === pred;
                            let bgColor = 'text-slate-500';
                            if (isDiagonal && count > 0) {
                              bgColor = 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/20';
                            } else if (!isDiagonal && count > 0) {
                              bgColor = 'bg-red-500/20 text-red-300 font-bold border border-red-500/30';
                            }
                            return (
                              <td key={pred} className="p-1">
                                <div className={`p-1 rounded ${bgColor}`}>
                                  {count}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Misclassified Examples Review */}
            <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold font-sans text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Boundary Misclassifications</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 font-mono">
                      {evaluationReport.misclassifiedExamples.length} instances
                    </span>
                  </span>
                  <button
                    onClick={() => setShowMisclassified(!showMisclassified)}
                    className="text-[11px] font-mono text-slate-400 hover:text-white underline"
                  >
                    {showMisclassified ? 'Collapse' : 'Expand'}
                  </button>
                </div>

                {evaluationReport.misclassifiedExamples.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono">
                    Zero misclassifications found on this test partition.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs font-mono">
                    {evaluationReport.misclassifiedExamples.slice(0, 6).map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-blue-400 font-bold">{ex.record_id}</span>
                          <span className="text-slate-500">{ex.package_id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400">Actual: <strong className="text-emerald-400">{ex.actual}</strong></span>
                          <span className="text-slate-500">→</span>
                          <span className="text-slate-400">Pred: <strong className="text-amber-400">{ex.predicted}</strong> ({ex.confidence}%)</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {ex.sensorSummary}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Limitation Commentary */}
              <div className="mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 font-sans leading-relaxed">
                <strong className="text-slate-200">Analysis & Limitations:</strong> Edge overlap occurs primarily between borderline road potholes and low-amplitude impacts (2.1g-2.4g), as well as boundary thermal fluctuations near 8.0°C. In physical hardware, multi-frequency FFT filtering and dynamic cold-chain thresholds will further resolve these edge boundaries.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SYNTHETIC DATASET PREVIEW TABLE */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold font-sans text-white uppercase tracking-wider">
              Synthetic Dataset Preview ({filteredRecords.length} records shown)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Scenario Class */}
            <select
              value={previewFilter}
              onChange={(e) => {
                setPreviewFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All 5 Scenario Classes</option>
              {SYNTHETIC_SCENARIO_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search ID, pkg..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-mono rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl overflow-x-auto backdrop-blur-md">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Record ID</th>
                <th className="py-2.5 px-3">Package</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Accel Mag</th>
                <th className="py-2.5 px-3 text-right">Tilt Angle</th>
                <th className="py-2.5 px-3 text-right">Temp (°C)</th>
                <th className="py-2.5 px-3 text-center">Tamper</th>
                <th className="py-2.5 px-3 text-right">GPS Coords</th>
                <th className="py-2.5 px-3">Scenario Label</th>
                <th className="py-2.5 px-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedRecords.map((r) => (
                <tr key={r.record_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-blue-400 font-bold">{r.record_id}</td>
                  <td className="py-2.5 px-3 text-slate-300">{r.package_id}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {r.timestamp.replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-300 font-medium">
                    {r.acceleration_magnitude_g.toFixed(2)}g
                  </td>
                  <td className="py-2.5 px-3 text-right text-purple-300">
                    {r.tilt_angle_degrees.toFixed(1)}°
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-300">
                    {r.temperature_celsius.toFixed(1)}°C
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {r.tamper_detected ? (
                      <span className="px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800 font-bold text-[10px]">
                        TRUE
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[10px]">FALSE</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                    {r.gps_latitude.toFixed(4)}, {r.gps_longitude.toFixed(4)}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    {getScenarioBadge(r.scenario_label)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.severity_label === 'CRITICAL'
                          ? 'bg-red-950/60 text-red-400 border border-red-800/60'
                          : r.severity_label === 'HIGH'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                          : r.severity_label === 'MEDIUM'
                          ? 'bg-yellow-950/60 text-yellow-300 border border-yellow-800/60'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      }`}
                    >
                      {r.severity_label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination & Quick Summary Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400 pt-1">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredRecords.length)} of{' '}
            {filteredRecords.length} records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-40 rounded-lg border border-slate-700/60"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-40 rounded-lg border border-slate-700/60"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
