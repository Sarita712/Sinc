import React, { useEffect, useState, useRef } from 'react';
import { connectionService } from '../services/connectionService';
import { VibrationCommand } from '../types';
import { Button } from './Button';
import { Wifi, Radio, StopCircle, Zap } from 'lucide-react';

export const Receiver: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<string>("Ready to connect");
  const [isVibrating, setIsVibrating] = useState(false);
  const [currentPatternName, setCurrentPatternName] = useState<string | null>(null);

  // Vibration API requires user interaction first.
  const enableVibration = () => {
    // Try a tiny vibe to unlock the API
    if (navigator.vibrate) {
      navigator.vibrate(50);
      setIsActive(true);
      setStatus("Listening for commands...");
    } else {
      setStatus("Vibration API not supported on this device.");
    }
  };

  useEffect(() => {
    connectionService.onMessage((command: VibrationCommand) => {
      if (!isActive) return;

      if (command.type === 'STOP') {
        navigator.vibrate(0);
        setIsVibrating(false);
        setCurrentPatternName(null);
        setStatus("Stopped.");
      } else if (command.type === 'SIMPLE') {
        if (navigator.vibrate) {
          // 10 seconds continuous vibration usually requires a loop or long duration support
          // Some browsers cap it. We'll try the direct requested duration.
          const duration = command.duration || 10000;
          navigator.vibrate(duration);
          setIsVibrating(true);
          setCurrentPatternName("Continuous Pulse");
          setStatus(`Vibrating for ${duration / 1000}s...`);
          
          setTimeout(() => {
            setIsVibrating(false);
            setCurrentPatternName(null);
            setStatus("Listening for commands...");
          }, duration);
        }
      } else if (command.type === 'PATTERN' && command.pattern) {
        if (navigator.vibrate) {
          navigator.vibrate(command.pattern);
          setIsVibrating(true);
          setCurrentPatternName(command.name || "Custom Pattern");
          setStatus(`Playing pattern: ${command.name || 'Unknown'}...`);
          
          // Estimate pattern duration to reset state
          const duration = command.pattern.reduce((a, b) => a + b, 0);
          setTimeout(() => {
            setIsVibrating(false);
            setCurrentPatternName(null);
            setStatus("Listening for commands...");
          }, duration);
        }
      }
    });

    return () => {
        // Cleanup if needed
    }
  }, [isActive]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-8 transition-all duration-500 ${isVibrating ? 'scale-105' : ''}`}>
      
      {/* Visualizer Circle */}
      <div className="relative">
        {isVibrating && (
           <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-40 animate-pulse-ring"></div>
        )}
        <div className={`relative flex items-center justify-center w-48 h-48 rounded-full border-4 transition-all duration-300 ${isVibrating ? 'border-indigo-400 bg-indigo-900/20 vibrating' : 'border-slate-700 bg-slate-900'}`}>
          {isVibrating ? (
             <Zap className="w-16 h-16 text-indigo-400 animate-pulse" />
          ) : (
             <Wifi className={`w-16 h-16 ${isActive ? 'text-emerald-500' : 'text-slate-600'}`} />
          )}
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isActive ? "Receiver Active" : "Activation Required"}
        </h2>
        <p className="text-slate-400 max-w-xs mx-auto">
          {status}
        </p>
        {currentPatternName && (
            <span className="inline-block px-3 py-1 mt-2 text-xs font-medium text-indigo-300 bg-indigo-900/30 rounded-full border border-indigo-500/20">
                {currentPatternName}
            </span>
        )}
      </div>

      {!isActive ? (
        <Button onClick={enableVibration} fullWidth className="max-w-xs">
          Enable Vibration Access
        </Button>
      ) : (
        <div className="flex flex-col space-y-4 w-full max-w-xs">
           <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-500 text-center">
             <p>Open this app in another tab to act as the Controller.</p>
           </div>
           <Button variant="secondary" onClick={onBack}>
             Disconnect
           </Button>
        </div>
      )}
    </div>
  );
};
