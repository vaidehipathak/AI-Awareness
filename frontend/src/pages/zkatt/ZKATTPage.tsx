import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, Mail, FileWarning, Wallet, 
  ChevronRight, ChevronLeft, RotateCcw, 
  Play, Pause, Terminal, Send, Search
} from 'lucide-react';
import { ZKATT_SCENARIOS, ZKATTSenario, ZKATTPhase } from '../../data/zkattScenarios';
import MockIdDemo from './MockIdDemo';

// --- TYPES ---
type Mode = 'GUIDED' | 'FREE' | 'PII_DEMO';
type SimulationState = 'IDLE' | 'LOADING' | 'PLAYING' | 'COMPLETED';

const ZKATTPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>('GUIDED');
  const [status, setStatus] = useState<SimulationState>('IDLE');
  const [scenario, setScenario] = useState<ZKATTSenario | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);

  // --- AUTO-ADVANCE LOGIC ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'PLAYING' && isAutoPlay && scenario) {
      if (currentPhase < scenario.phases.length - 1) {
        timer = setTimeout(() => {
          setCurrentPhase(prev => prev + 1);
        }, 4000);
      } else {
        setStatus('COMPLETED');
      }
    }
    return () => clearTimeout(timer);
  }, [status, currentPhase, isAutoPlay, scenario]);

  // --- HANDLERS ---
  const handleLaunchScenario = (sc: ZKATTSenario) => {
    setScenario(sc);
    setCurrentPhase(0);
    setStatus('PLAYING');
  };

  const handleFreePrompt = async () => {
    if (!prompt.trim()) return;
    setStatus('LOADING');
    setLoadingLogs(['INITIALIZING AI ENGINE...', 'ANALYZING ATTACK VECTOR...']);
    
    // Simulate terminal logs
    const interval = setInterval(() => {
        setLoadingLogs(prev => [...prev, `FETCHING DATA: ${Math.random().toString(36).substring(7).toUpperCase()}...`]);
    }, 800);

    try {
      const response = await fetch('/api/zkatt/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      clearInterval(interval);

      if (data.phases) {
        setScenario(data);
        setStatus('PLAYING');
        setCurrentPhase(0);
      } else {
        // Fallback
        handleFallback(prompt);
      }
    } catch (e) {
      clearInterval(interval);
      handleFallback(prompt);
    }
  };

  const handleFallback = (input: string) => {
    const lowerInput = input.toLowerCase();
    let bestMatch = ZKATT_SCENARIOS[0]; // Default Phishing
    if (lowerInput.includes('money') || lowerInput.includes('bank') || lowerInput.includes('card')) {
        bestMatch = ZKATT_SCENARIOS[2];
    } else if (lowerInput.includes('file') || lowerInput.includes('malware') || lowerInput.includes('virus')) {
        bestMatch = ZKATT_SCENARIOS[1];
    }
    setScenario(bestMatch);
    setStatus('PLAYING');
    setCurrentPhase(0);
    // Simple alert-like toast simulated
    console.log("Fallback triggered: Switched to Guided Mode");
  };

  const reset = () => {
    setStatus('IDLE');
    setScenario(null);
    setCurrentPhase(0);
    setPrompt('');
  };

  // --- RENDER HELPERS ---
  const getPhaseColor = (index: number) => {
    const colors = [
      'border-red-500 shadow-red-500/20 text-red-500', 
      'border-slate-400 shadow-slate-500/20 text-slate-300', 
      'border-orange-600 shadow-orange-600/20 text-orange-500', 
      'border-amber-400 shadow-amber-400/20 text-amber-400', 
      'border-emerald-500 shadow-emerald-500/20 text-emerald-500'
    ];
    return colors[index] || 'border-indigo-500';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono p-4 md:p-8 pt-24 relative overflow-hidden">
      
      {/* SCANLINE EFFECT */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-50"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 flex items-center justify-center gap-4">
                <ShieldAlert className="w-10 h-10 text-indigo-500" />
                Z-KATT <span className="text-indigo-500">ENGINE v1.0</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto italic">Zero-Knowledge Attack Training Tool</p>
        </div>

        {/* MODE SWITCHER */}
        {status === 'IDLE' && (
            <div className="flex justify-center mb-12">
                <div className="bg-white/5 backdrop-blur-md p-1 rounded-full border border-white/10 inline-flex">
                    <button 
                        onClick={() => setMode('GUIDED')}
                        className={`px-8 py-2 rounded-full font-bold transition-all ${mode === 'GUIDED' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'text-slate-400 hover:text-white'}`}
                    >
                        GUIDED MODE
                    </button>
                    <button 
                        onClick={() => setMode('FREE')}
                        className={`px-8 py-2 rounded-full font-bold transition-all ${mode === 'FREE' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'text-slate-400 hover:text-white'}`}
                    >
                        FREE PROMPT
                    </button>
                    <button 
                        onClick={() => setMode('PII_DEMO')}
                        className={`px-8 py-2 rounded-full font-bold transition-all ${mode === 'PII_DEMO' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'text-slate-400 hover:text-white'}`}
                    >
                        PII DEMO
                    </button>
                </div>
            </div>
        )}

        {/* MAIN DISPLAY AREA */}
        <div className="min-h-[500px]">
            {status === 'IDLE' && mode === 'GUIDED' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {ZKATT_SCENARIOS.map(sc => (
                        <div 
                            key={sc.id}
                            onClick={() => handleLaunchScenario(sc)}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-white/10 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                {sc.id === 'phishing' && <Mail className="w-12 h-12" />}
                                {sc.id === 'malware' && <FileWarning className="w-12 h-12" />}
                                {sc.id === 'financial' && <Wallet className="w-12 h-12" />}
                            </div>
                            <h3 className="text-xl font-black mb-2 text-indigo-400">{sc.category}</h3>
                            <p className="text-sm text-slate-400 mb-4">{sc.description}</p>
                            <div className="flex items-center text-xs font-bold text-slate-500 group-hover:text-white transition-colors">
                                INITIATE SIMULATION <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    ))}
                    {/* COMING SOON SLOTS */}
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl opacity-50 grayscale cursor-not-allowed">
                            <div className="inline-block px-2 py-1 bg-white/10 rounded text-[10px] mb-2">COMING SOON</div>
                            <h3 className="text-xl font-black mb-2 text-slate-600">New Category {i}</h3>
                            <p className="text-sm text-slate-700">Encrypted transmission pending...</p>
                        </div>
                    ))}
                </div>
            )}

            {status === 'IDLE' && mode === 'FREE' && (
                <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                        <Terminal className="w-8 h-8 text-indigo-500 mb-4" />
                        <h2 className="text-2xl font-black mb-2">FREE PROMPT INJECTION</h2>
                        <p className="text-slate-400 text-sm mb-6 italic">Describe any cyber attack scenario, and the AI will generate a step-by-step simulation.</p>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. A SQL injection attack on a local pizza shop database..."
                            className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-indigo-400 focus:border-indigo-500 outline-none transition-all resize-none mb-4"
                        />
                        <button 
                            onClick={handleFreePrompt}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all"
                        >
                            GENERATE SIMULATION <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {status === 'IDLE' && mode === 'PII_DEMO' && (
                <MockIdDemo />
            )}

            {status === 'LOADING' && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-black/80 border border-indigo-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <h2 className="text-xl font-bold text-indigo-400 animate-pulse">EXECUTING AI ENGINE...</h2>
                        </div>
                        <div className="space-y-2 font-mono text-xs overflow-hidden h-48 scroll-smooth">
                            {loadingLogs.map((log, i) => (
                                <div key={i} className="text-emerald-500/80">
                                    <span className="text-white opacity-30">[{new Date().toLocaleTimeString()}]</span> {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {(status === 'PLAYING' || status === 'COMPLETED') && scenario && (
                <div className="animate-in fade-in duration-700">
                    {/* PROGRESS BAR */}
                    <div className="max-w-3xl mx-auto mb-8 flex gap-2">
                        {scenario.phases.map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-2 flex-1 rounded-full transition-all duration-1000 ${i <= currentPhase ? 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)]' : 'bg-white/10'}`}
                            />
                        ))}
                    </div>

                    {/* PHASE PLAYER */}
                    <div className={`max-w-4xl mx-auto bg-black/60 backdrop-blur-2xl border-2 rounded-3xl p-8 md:p-12 transition-all duration-500 ${getPhaseColor(currentPhase)}`}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-widest opacity-50 block mb-1">Phase {currentPhase + 1} / 5</span>
                                <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter transition-all">
                                    {scenario.phases[currentPhase].phase}
                                </h2>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </button>
                                <button 
                                    onClick={reset}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="text-xl leading-relaxed animate-in fade-in slide-in-from-left-4 duration-500">
                                {scenario.phases[currentPhase].content}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {scenario.phases[currentPhase].details.map((detail, idx) => (
                                    <div key={idx} className="flex gap-3 items-start bg-white/5 p-4 rounded-xl border border-white/5 border-l-4 border-l-inherit animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current mt-2" />
                                        <span className="text-sm opacity-80">{detail}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CONTROLS */}
                        <div className="mt-12 flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                            <button 
                                onClick={() => setCurrentPhase(p => Math.max(0, p - 1))}
                                disabled={currentPhase === 0}
                                className="flex items-center gap-2 font-bold px-4 py-2 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-all"
                            >
                                <ChevronLeft /> PREV
                            </button>
                            
                            {status === 'COMPLETED' ? (
                                <button 
                                    onClick={reset}
                                    className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-black transition-all shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                                >
                                    RESTART
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setCurrentPhase(p => Math.min(scenario.phases.length - 1, p + 1))}
                                    className="flex items-center gap-2 font-bold px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/10"
                                >
                                    NEXT <ChevronRight />
                                </button>
                            )}
                        </div>
                    </div>

                    {mode === 'FREE' && (
                        <div className="text-center mt-8 text-xs text-slate-500 italic flex items-center justify-center gap-2">
                            <Search className="w-3 h-3" />
                            ⚠ Experimental mode — AI-generated results may vary. For reliable learning, use Guided Mode.
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ZKATTPage;
