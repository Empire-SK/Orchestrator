
import React, { useState, useEffect } from 'react';
import { analyzeObservation, generateVisionVideo } from '../services/geminiService';
import { AIResponse, NeedStatement } from '../types';
import { ICONS } from '../constants';

const TableRow: React.FC<{ data: NeedStatement }> = ({ data }) => (
  <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
    <td className="p-4 text-sm font-medium text-slate-900 max-w-xs">{data.statement}</td>
    <td className="p-4 text-xs text-slate-500 uppercase font-semibold">{data.category}</td>
    <td className="p-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${data.impactScore > 7 ? 'bg-red-500' : 'bg-blue-500'}`} 
            style={{ width: `${data.impactScore * 10}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-700">{data.impactScore}</span>
      </div>
    </td>
    <td className="p-4 text-xs text-slate-500">{data.marketPotential}</td>
    <td className="p-4">
      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
        data.riskLevel === 'Low' ? 'bg-green-50 text-green-700' : 
        data.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700' : 
        'bg-red-50 text-red-700'
      }`}>
        {data.riskLevel}
      </span>
    </td>
    <td className="p-4 text-xs font-bold text-slate-700">{data.feasibility}/10</td>
    <td className="p-4 text-xs italic text-slate-400">{data.timeToExecution}</td>
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

  const loadingMessages = [
    "Analyzing clinical barriers...",
    "Ideating accessible solutions...",
    "Synthesizing universal design principles...",
    "Generating high-fidelity visualization..."
  ];

  // Logic to rotate loading messages for improved UX during long video generation tasks.
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

  /**
   * Handles high-quality video generation for the intervention visualization.
   * Includes API key selection logic and recovery for specific error states as required by guidelines.
   */
  const handleVision = async () => {
    // Check whether an API key has been selected before starting video generation.
    if (!(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      // Proceed directly after opening dialog to avoid race conditions.
    }
    
    setIsVideoLoading(true);
    setError('');
    try {
      const url = await generateVisionVideo(`Assistive device concept based on: ${result?.insights.observation || input}`);
      setVideoUrl(url);
    } catch (err: any) {
      // If request fails with 404/Requested entity was not found, trigger re-selection of key.
      if (err.message?.includes("Requested entity was not found.")) {
        await window.aistudio.openSelectKey();
        setError('Session expired. Please select a paid API key again to continue.');
      } else {
        setError('Visualization generation failed. Please ensure a paid API key is selected.');
      }
    } finally {
      setIsVideoLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setInput(prev => `[Observation Video: ${fileName}]\n\nUser Profile: \nBehavior Observed: \n${prev}`);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Researcher Dashboard</h1>
            <p className="text-slate-500">Clinical Observation Analysis & Need Finding Hub</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Export Clinical Data
            </button>
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-blue-700">
              Collaborate
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 premium-shadow">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2 text-blue-600">
                    <ICONS.Video className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">New Video Case</span>
                 </div>
                 <label className="cursor-pointer text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
                    Upload MP4/MOV
                    <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
                 </label>
              </div>
              
              <div className="mb-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Researcher Notes & Disability Context</label>
                <textarea
                  className="w-full h-48 p-4 bg-slate-50 border border-slate-100 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  placeholder="Describe the person's functional limitations (e.g. limited dexterity, paraplegia) and the specific activities being observed..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isLoading || !input}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Extract Assistive Needs <ICONS.Zap className="w-4 h-4" /></>
                )}
              </button>
              {error && <p className="mt-4 text-xs text-red-500 font-medium">{error}</p>}
            </div>

            {result && (
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 premium-shadow animate-fade-in">
                <h3 className="text-lg font-bold mb-4">Observation Synthesis</h3>
                <div className="space-y-4">
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clinical Context</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{result.insights.context}</p>
                   </div>
                   <button 
                    onClick={handleVision}
                    disabled={isVideoLoading}
                    className="w-full py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-100 flex items-center justify-center gap-2"
                   >
                    {isVideoLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                        <span>{videoLoadingMessage}</span>
                      </div>
                    ) : (
                      <><ICONS.Video className="w-4 h-4" /> Visualize Intervention</>
                    )}
                   </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            {!result && !isLoading && (
              <div className="h-[600px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center p-12">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <ICONS.Table className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">Awaiting Clinical Data</h3>
                <p className="text-slate-400 max-w-sm">Upload an observation video or paste notes on the left to generate the Assistive Tech Evaluation Table.</p>
              </div>
            )}

            {isLoading && (
              <div className="space-y-4">
                <div className="h-12 bg-white rounded-xl animate-pulse border border-slate-100" />
                <div className="h-96 bg-white rounded-[2rem] animate-pulse border border-slate-100" />
              </div>
            )}

            {result && !isLoading && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 premium-shadow overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <ICONS.Table className="w-5 h-5 text-blue-600" />
                      Assistive Need Evaluation Table
                    </h3>
                    <div className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                      BIO-DESIGN FRAMEWORK
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                        <tr>
                          <th className="p-4 text-left">Functional Need</th>
                          <th className="p-4 text-left">Barrier Type</th>
                          <th className="p-4 text-left">Need Score</th>
                          <th className="p-4 text-left">Device Market</th>
                          <th className="p-4 text-left">Clinical Risk</th>
                          <th className="p-4 text-left">R&D Feasibility</th>
                          <th className="p-4 text-left">Timeline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.tableData.map((row, i) => (
                          <TableRow key={i} data={row} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-6 rounded-[2rem] border border-slate-200 premium-shadow">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Key Pain Points</h4>
                      <ul className="space-y-3">
                         {result.insights.keyInsights.map((ki, i) => (
                           <li key={i} className="flex gap-3 text-sm text-slate-600">
                              <span className="text-blue-500 font-bold">•</span> {ki}
                           </li>
                         ))}
                      </ul>
                   </div>
                   <div className="bg-white p-6 rounded-[2rem] border border-slate-200 premium-shadow">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Intervention Strategy</h4>
                      <ul className="space-y-3">
                         {result.insights.recommendations.map((rec, i) => (
                           <li key={i} className="flex gap-3 text-sm text-slate-600">
                              <span className="text-green-500 font-bold">✓</span> {rec}
                           </li>
                         ))}
                      </ul>
                   </div>
                </div>

                {videoUrl && (
                  <div className="bg-slate-900 rounded-[2.5rem] p-2 premium-shadow">
                    <div className="p-4 text-center">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Intervention Visualization</h4>
                    </div>
                    <video 
                      src={videoUrl} 
                      className="w-full rounded-[2.2rem] aspect-video object-cover" 
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
    </div>
  );
};

export default Demo;
