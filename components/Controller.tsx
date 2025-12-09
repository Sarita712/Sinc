import React, { useState } from 'react';
import { connectionService } from '../services/connectionService';
import { generateVibrationPattern } from '../services/geminiService';
import { Button } from './Button';
import { Sparkles, Activity, Square, Radio } from 'lucide-react';

export const Controller: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSimpleVibrate = () => {
    connectionService.sendCommand({
      type: 'SIMPLE',
      duration: 10000
    });
    showFeedback("Sent 10s Vibration Signal");
  };

  const handleStop = () => {
    connectionService.sendCommand({
      type: 'STOP'
    });
    showFeedback("Sent Stop Signal");
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const pattern = await generateVibrationPattern(customPrompt);
      connectionService.sendCommand({
        type: 'PATTERN',
        pattern: pattern,
        name: customPrompt
      });
      showFeedback(`Sent AI Pattern: "${customPrompt}"`);
      setCustomPrompt("");
    } catch (err) {
      showFeedback("Failed to generate pattern.");
    } finally {
      setIsGenerating(false);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4 space-y-6">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-indigo-400">
           <Radio className="w-5 h-5 animate-pulse" />
           <span className="font-semibold tracking-wide uppercase text-xs">Controller Mode</span>
        </div>
        <button onClick={onBack} className="text-xs text-slate-500 hover:text-white transition-colors">
            Switch Mode
        </button>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleSimpleVibrate}
          className="group relative flex flex-col items-center justify-center p-6 space-y-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-900/20"
        >
          <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-white">10s Vibrate</span>
        </button>

        <button
          onClick={handleStop}
          className="group relative flex flex-col items-center justify-center p-6 space-y-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all duration-200 active:scale-95 border border-slate-700"
        >
          <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
            <StopCircle className="w-8 h-8 text-rose-400" />
          </div>
          <span className="font-bold text-slate-200">Stop All</span>
        </button>
      </div>

      {/* AI Section */}
      <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-white">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold">AI Pattern Generator</h3>
        </div>
        
        <form onSubmit={handleAIGenerate} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Heartbeat, Explosion, Rainfall..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
            />
          </div>
          <Button 
            type="submit" 
            fullWidth 
            isLoading={isGenerating}
            disabled={!customPrompt.trim()}
            variant="secondary"
            className="!bg-slate-800 hover:!bg-slate-700"
          >
            Generate & Send
          </Button>
        </form>
      </div>

      {/* Feedback Toast */}
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-emerald-600 text-white rounded-full text-sm font-medium shadow-xl transition-all duration-300 ${feedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {feedback}
      </div>

    </div>
  );
};

function StopCircle({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <rect x="9" y="9" width="6" height="6" />
        </svg>
    )
}
