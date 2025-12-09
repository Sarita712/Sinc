import React, { useEffect, useState, useRef } from 'react';
import { connectionService } from '../services/connectionService';
import { generateVibrationPattern } from '../services/geminiService';
import { VibrationCommand } from '../types';
import { Button } from './Button';
import { Zap, Radio, StopCircle, Sparkles, Activity, Hand, Power } from 'lucide-react';

export const Dashboard: React.FC<{ onLeave: () => void }> = ({ onLeave }) => {
  const [isReceiving, setIsReceiving] = useState(false);
  const [lastReceivedName, setLastReceivedName] = useState<string | null>(null);
  
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Use refs to track holding state to avoid re-renders interfering with touch events
  const isHoldingRef = useRef(false);

  // --- Receiver Logic ---
  useEffect(() => {
    const handleCommand = (command: VibrationCommand) => {
      // Always stop previous vibration to prevent conflicts
      navigator.vibrate(0);

      if (command.type === 'STOP') {
        setIsReceiving(false);
        setLastReceivedName(null);
        showFeedback("Pattern Stopped");
      } else if (command.type === 'SIMPLE') {
        const duration = command.duration || 1000;
        if (navigator.vibrate(duration)) {
            setIsReceiving(true);
            setLastReceivedName("Simple Pulse");
            
            // Auto reset visual state after duration
            setTimeout(() => {
                setIsReceiving(false);
            }, duration);
        }
      } else if (command.type === 'PATTERN' && command.pattern) {
        if (navigator.vibrate(command.pattern)) {
            setIsReceiving(true);
            setLastReceivedName(command.name || "Custom Pattern");
            
            const duration = command.pattern.reduce((a, b) => a + b, 0);
            setTimeout(() => {
                setIsReceiving(false);
            }, duration);
        }
      }
    };

    connectionService.onMessage(handleCommand);

    // No cleanup strictly needed for the singleton service listener in this demo
    return () => {};
  }, []);

  // --- Sender Logic ---

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  };

  const sendSimple = (duration: number) => {
    connectionService.sendCommand({
      type: 'SIMPLE',
      duration: duration
    });
    showFeedback(`Sent ${duration/1000}s Vibrate`);
  };

  const sendStop = () => {
    connectionService.sendCommand({ type: 'STOP' });
    showFeedback("Sent Stop");
  };

  const sendPattern = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const pattern = await generateVibrationPattern(customPrompt);
      connectionService.sendCommand({
        type: 'PATTERN',
        pattern: pattern,
        name: customPrompt
      });
      showFeedback(`Sent "${customPrompt}"`);
      setCustomPrompt("");
    } catch (err) {
      showFeedback("Failed to generate");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Touch/Hold Logic ---
  const startHold = (e: React.SyntheticEvent) => {
    e.preventDefault(); // Prevent context menu
    if (isHoldingRef.current) return;
    isHoldingRef.current = true;
    
    // Send a long vibration command (e.g., 30s) effectively "ON"
    connectionService.sendCommand({ type: 'SIMPLE', duration: 30000 });
    navigator.vibrate(50); // Small haptic feedback for the sender
  };

  const endHold = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    
    connectionService.sendCommand({ type: 'STOP' });
  };

  return (
    <div className={`relative flex flex-col w-full max-w-md mx-auto min-h-[80vh] transition-all duration-300 ${isReceiving ? 'scale-[1.02]' : ''}`}>
      
      {/* Background Pulse Effect when Receiving */}
      {isReceiving && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
           <div className="w-[150%] h-[150%] bg-indigo-600/20 rounded-full animate-pulse-ring"></div>
           <div className="absolute w-[120%] h-[120%] bg-indigo-600/20 rounded-full animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md rounded-b-2xl border-b border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border ${isReceiving ? 'bg-indigo-500 border-indigo-400 animate-bounce' : 'bg-emerald-500/10 border-emerald-500/50'}`}>
            {isReceiving ? <Zap className="w-5 h-5 text-white" /> : <Radio className="w-5 h-5 text-emerald-500" />}
          </div>
          <div>
            <h2 className="font-bold text-white leading-tight">Connected</h2>
            <p className="text-xs text-slate-400 font-medium">
              {isReceiving ? `Receiving: ${lastReceivedName}` : "Ready to send & receive"}
            </p>
          </div>
        </div>
        <button onClick={onLeave} className="p-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <Power className="w-5 h-5" />
        </button>
      </div>

      {/* Main Controls */}
      <div className="relative z-10 flex-1 flex flex-col justify-center p-6 space-y-6">
        
        {/* Hold to Buzz Button */}
        <button
          className="group relative w-full aspect-square max-h-64 mx-auto rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-700 shadow-2xl shadow-indigo-900/40 active:scale-95 transition-all duration-150 border-4 border-indigo-500/30 touch-none select-none"
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
        >
          <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-colors"></div>
          <Hand className="w-16 h-16 text-white mb-2" />
          <span className="text-lg font-black text-white uppercase tracking-wider">Hold to Vibrate</span>
          <span className="text-xs text-indigo-200 mt-1">Press & Hold</span>
        </button>

        {/* Preset Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => sendSimple(10000)}
            className="flex items-center justify-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all active:scale-95"
          >
            <Activity className="w-5 h-5 text-indigo-400" />
            <span className="font-bold">10s Pulse</span>
          </button>
          
          <button
            onClick={sendStop}
            className="flex items-center justify-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 text-rose-200 rounded-xl border border-slate-700 transition-all active:scale-95"
          >
            <StopCircle className="w-5 h-5 text-rose-500" />
            <span className="font-bold">Stop All</span>
          </button>
        </div>

        {/* AI Section */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
           <div className="flex items-center gap-2 mb-3 text-slate-300">
             <Sparkles className="w-4 h-4 text-amber-400" />
             <span className="text-sm font-semibold">AI Pattern Generator</span>
           </div>
           <form onSubmit={sendPattern} className="flex gap-2">
             <input
               type="text"
               value={customPrompt}
               onChange={(e) => setCustomPrompt(e.target.value)}
               placeholder="Explosion, Heartbeat..."
               className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
             />
             <Button 
                type="submit" 
                variant="primary" 
                className="!px-4 !py-2 !text-sm"
                isLoading={isGenerating}
                disabled={!customPrompt.trim()}
             >
               Gen
             </Button>
           </form>
        </div>
      </div>

      {/* Feedback Toast */}
      <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none transition-all duration-300 ${feedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-full border border-slate-700 shadow-xl flex items-center gap-2 text-sm font-medium">
           {feedback && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
           {feedback}
        </div>
      </div>

    </div>
  );
};