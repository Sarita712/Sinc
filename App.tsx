import React, { useState } from 'react';
import { AppMode } from './types';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/Button';
import { Zap, Smartphone } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.WELCOME);

  const startSession = () => {
    // Attempt to unlock vibration API immediately on user interaction
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    setMode(AppMode.ACTIVE);
  };

  const renderContent = () => {
    if (mode === AppMode.ACTIVE) {
      return <Dashboard onLeave={() => setMode(AppMode.WELCOME)} />;
    }

    return (
      <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-sm mx-auto text-center">
        
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-2">
            <Zap className="w-12 h-12 text-indigo-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Vibe<span className="text-indigo-500">Sync</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Bidirectional Haptic Control.
            <br/>
            <span className="text-sm text-slate-500">Connect two devices to vibrate each other.</span>
          </p>
        </div>

        <div className="w-full pt-4">
          <Button 
            onClick={startSession} 
            fullWidth 
            className="!text-lg !py-4 shadow-indigo-500/20 shadow-2xl"
          >
            Connect & Start
          </Button>
          <p className="mt-4 text-xs text-slate-600">
            Open this app on another device to pair automatically.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full opacity-60">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center gap-2">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Device A</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center gap-2">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Device B</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 overflow-hidden">
      {renderContent()}
    </div>
  );
}