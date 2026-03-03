
import React, { useState, useEffect } from 'react';
import { analyzeObservation, generateVisionVideo } from '../services/geminiService';
import { AIResponse, NeedStatement } from '../types';
import { ICONS } from '../constants';

const TableRow: React.FC<{ data: NeedStatement, brainstorm?: string }> = ({ data, brainstorm }) => (
  <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
    <td className="p-4 text-xs text-slate-600 border-r border-slate-50">{data.barrier}</td>
    <td className="p-4 text-xs text-slate-600 border-r border-slate-50">{data.stakeholder}</td>
    <td className="p-4 text-xs text-slate-600 border-r border-slate-50 italic">{data.pain}</td>
    <td className="p-4 text-xs text-slate-600 border-r border-slate-50">{data.workaround}</td>
    <td className="p-4 text-xs font-bold text-blue-700 border-r border-slate-50">{data.need}</td>
    <td className="p-4 text-xs font-medium text-slate-900 border-r border-slate-50">{data.statement}</td>
    <td className="p-4 text-[11px] text-slate-500">{brainstorm || '-'}</td>
  </tr>
);

const Demo = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoLoadingMessage, setVideoLoadingMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  const analysisMessages = [
    "Warming up the intelligence engine...",
    "Identifying key actions from observation...",
    "Understanding clinical context...",
    "Extracting physical and cognitive barriers...",
    "Synthesizing assistive technology needs...",
    "Formatting Orchestrator Evaluation Table..."
  ];

  // New state for handling the actual video file to be analyzed
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isVideoAnalyzing, setIsVideoAnalyzing] = useState(false);

  const loadingMessages = [
    "Analyzing clinical barriers...",
    "Ideating accessible solutions...",
    "Synthesizing universal design principles...",
    "Generating high-fidelity visualization..."
  ];

  useEffect(() => {
    let interval: number;
    if (isVideoLoading) {
      let i = 0;
      setVideoLoadingMessage(loadingMessages[0]);
      interval = window.setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setVideoLoadingMessage(loadingMessages[i]);
      }, 5000);
    }
    return () => window.clearInterval(interval);
  }, [isVideoLoading]);

  useEffect(() => {
    let interval: number;

    if (isLoading || isVideoAnalyzing) {
      let i = 0;
      setAnalysisStepIndex(0);

      interval = window.setInterval(() => {
        i = Math.min(i + 1, analysisMessages.length - 1);
        setAnalysisStepIndex(i);
      }, 4000);

    }
    return () => window.clearInterval(interval);
  }, [isLoading, isVideoAnalyzing]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await analyzeObservation(input);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please verify your API setup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!selectedVideoFile) return;
    setIsVideoAnalyzing(true);
    setError('');
    try {
      // Assuming new function `analyzeVideoFile` in geminiService
      const { analyzeVideoFile } = await import('../services/geminiService');
      const data = await analyzeVideoFile(selectedVideoFile, input);
      setResult(data);
      // Optional: keep standard text input visible instead of clearing
      // setInput('');
    } catch (err: any) {
      setError(err.message || 'Video Analysis failed. Please verify your API setup.');
    } finally {
      setIsVideoAnalyzing(false);
    }
  };

  const handleVision = async () => {
    // Note: AI Studio key selection is removed as we moved keys to the backend.
    // However, vision generation is currently disabled due to enterprise constraints.
    setIsVideoLoading(true);
    setError('');
    try {
      const { generateVisionVideo } = await import('../services/geminiService');
      const url = await generateVisionVideo(`Assistive device concept based on: ${result?.insights?.observationSummary || input}`);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.message || 'Visualization generation failed.');
    } finally {
      setIsVideoLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!result || !result.tableData) return;

    const headers = [
      "Barrier",
      "Stakeholder",
      "Pain",
      "Workaround",
      "Core Need",
      "Need Statement",
      "Problem Brainstorm",
      "Questions"
    ];

    const maxRows = Math.max(
      result.tableData?.length || 0,
      result.insights?.problemBrainstorm?.length || 0,
      result.insights?.questions?.length || 0
    );

    const rows = Array.from({ length: maxRows }).map((_, i) => {
      const row = result.tableData?.[i] || { barrier: '', stakeholder: '', pain: '', workaround: '', need: '', statement: '' };
      const brainstorm = result.insights?.problemBrainstorm?.[i] || '';
      const question = result.insights?.questions?.[i] || '';

      return [
        `"${row.barrier.replace(/"/g, '""')}"`,
        `"${row.stakeholder.replace(/"/g, '""')}"`,
        `"${row.pain.replace(/"/g, '""')}"`,
        `"${row.workaround.replace(/"/g, '""')}"`,
        `"${row.need.replace(/"/g, '""')}"`,
        `"${row.statement.replace(/"/g, '""')}"`,
        `"${brainstorm.replace(/"/g, '""')}"`,
        `"${question.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    // Ensure UTF-8 with BOM for Excel compatibility
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orchestrator-analysis-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      // Clear previous results/inputs if any
      setResult(null);
      setInput('');
      setError('');
    }
  };


  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <header className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">ORCHESTRATOR</h1>
          <div className="h-1 w-16 md:w-24 bg-blue-600 mx-auto rounded-full" />
          <p className="text-slate-500 mt-3 md:mt-4 font-medium uppercase tracking-widest text-[10px] sm:text-xs">Clinical Observation & Need Synthesis Framework</p>
        </header>

        <div className="grid grid-cols-12 gap-6 md:gap-8">
          {/* Left Input Section */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 premium-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-blue-600">
                  <ICONS.Video className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">Analysis Hub</span>
                </div>
                <label className="cursor-pointer text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
                  Add Video
                  <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
                </label>
              </div>

              {videoPreviewUrl && (
                <div className="mb-4 bg-slate-900 rounded-2xl overflow-hidden aspect-video relative">
                  <video src={videoPreviewUrl} className="w-full h-full object-cover" controls />
                  <button
                    onClick={() => { setSelectedVideoFile(null); setVideoPreviewUrl(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="mb-4">
                <textarea
                  className="w-full h-40 p-4 bg-slate-50 border border-slate-100 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  placeholder="Paste observation notes here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={selectedVideoFile ? handleAnalyzeVideo : handleAnalyze}
                  disabled={(isLoading || isVideoAnalyzing) || (!input && !selectedVideoFile)}
                  className={`w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors ${selectedVideoFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                >
                  {isLoading || isVideoAnalyzing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{selectedVideoFile ? 'Analyze Video + Notes' : 'Synthesize Text'} <ICONS.Zap className="w-4 h-4" /></>
                  )}
                </button>
              </div>

              {error && <p className="mt-4 text-xs text-red-500 font-medium">{error}</p>}
            </div>

            {result && result.insights?.questions && result.insights.questions.length > 0 && (
              <div className="bg-slate-900 p-6 rounded-[2rem] text-white animate-fade-in">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Research Questions?</h3>
                <ul className="space-y-4">
                  {result.insights.questions.map((q, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-3 leading-relaxed">
                      <span className="text-blue-400 font-bold">?</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Results Section */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {!result && !isLoading && !isVideoAnalyzing && (
              <div className="min-h-[400px] lg:h-[600px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] text-center p-6 md:p-12">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <ICONS.Table className="w-8 h-8 md:w-10 md:h-10 text-slate-200" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-400 mb-2">Framework Ready</h3>
                <p className="text-slate-400 text-sm md:text-base max-w-sm">Capture observations to generate the Orchestrator Evaluation Table.</p>
              </div>
            )}

            {(isLoading || isVideoAnalyzing) && (
              <div className="min-h-[400px] lg:h-[600px] flex flex-col items-center justify-center relative bg-[#FDFDFD] border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] p-6 sm:p-12 overflow-hidden shadow-sm">

                {/* Extremely subtle ambient glow to match the clean reference */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-200/30 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col w-full max-w-sm mx-auto items-start space-y-6">
                  {analysisMessages.map((msg, idx) => {
                    const isCompleted = idx < analysisStepIndex;
                    const isActive = idx === analysisStepIndex;
                    const isFuture = idx > analysisStepIndex;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-4 transition-all duration-700 ease-out ${isFuture ? 'opacity-30 translate-y-4' :
                          isActive ? 'opacity-100 transform translate-y-0 scale-[1.02] origin-left' :
                            'opacity-60 translate-y-0'
                          }`}
                      >
                        {/* Status Icon */}
                        <div className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${isActive
                          ? 'bg-slate-900 border-2 border-slate-900'
                          : isCompleted
                            ? 'bg-slate-400 border-2 border-slate-400'
                            : 'bg-transparent border-2 border-slate-300'
                          }`}>
                          {(!isFuture) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        {/* Step Text */}
                        <span className={`text-[15px] tracking-wide transition-colors duration-500 font-outfit ${isActive
                          ? 'text-slate-900 font-medium'
                          : isCompleted
                            ? 'text-slate-500 font-normal'
                            : 'text-slate-400 font-normal'
                          }`}>
                          {msg}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {result && !isLoading && !isVideoAnalyzing && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 premium-shadow overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                      <ICONS.Table className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Observation Evaluation Table
                    </h3>
                    <button
                      onClick={handleExportCSV}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white border border-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
                    >
                      <ICONS.Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                          <th colSpan={4} className="p-4 border-r border-slate-100 text-center bg-slate-100/30">Observation Details</th>
                          <th className="p-4 text-left border-r border-slate-100">Needs</th>
                          <th className="p-4 text-left border-r border-slate-100">Statement</th>
                          <th className="p-4 text-left">Ideation</th>
                        </tr>
                        <tr className="bg-white text-[9px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                          <th className="p-3 text-left border-r border-slate-50 w-48">Barrier</th>
                          <th className="p-3 text-left border-r border-slate-50 w-32">Stakeholder</th>
                          <th className="p-3 text-left border-r border-slate-50 w-48">Pain</th>
                          <th className="p-3 text-left border-r border-slate-100 w-48">Workaround</th>
                          <th className="p-3 text-left border-r border-slate-50 w-48">Core Need</th>
                          <th className="p-3 text-left border-r border-slate-50 w-64">Need Statement</th>
                          <th className="p-3 text-left w-64">Problem Brainstorm</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({
                          length: Math.max(result.tableData?.length || 0, result.insights?.problemBrainstorm?.length || 0)
                        }).map((_, i) => (
                          <TableRow
                            key={i}
                            data={result.tableData?.[i] || { barrier: '', stakeholder: '', pain: '', workaround: '', need: '', statement: '' }}
                            brainstorm={result.insights?.problemBrainstorm?.[i]}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 premium-shadow">
                    <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">Observation Context</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{result.insights?.context}</p>
                  </div>
                  <div className="w-full md:w-80">
                    <button
                      onClick={handleVision}
                      disabled={isVideoLoading}
                      className="w-full h-full min-h-[80px] md:min-h-[100px] bg-blue-600 text-white rounded-[1.5rem] md:rounded-[2rem] text-xs sm:text-sm font-bold hover:bg-blue-700 flex flex-col items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.02]"
                    >
                      {isVideoLoading ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-[10px] text-white/70 uppercase tracking-widest">{videoLoadingMessage}</span>
                        </div>
                      ) : (
                        <><ICONS.Video className="w-6 h-6" /> <span>Visualize<br />Solution</span></>
                      )}
                    </button>
                  </div>
                </div>

                {videoUrl && (
                  <div className="bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] p-1 sm:p-2 premium-shadow overflow-hidden">
                    <video
                      src={videoUrl}
                      className="w-full rounded-[1.2rem] sm:rounded-[2.2rem] aspect-video object-cover"
                      controls
                      autoPlay
                      loop
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default Demo;
