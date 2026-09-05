import React from 'react';
import { Sparkles, Key, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  title: string;
  subtitle: string;
  progress: number;
  engineInfo?: string;
  keySlot?: string;
  activeModel?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  title, 
  subtitle, 
  progress, 
  engineInfo, 
  keySlot, 
  activeModel = 'gemini-2.5-flash' 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl space-y-6 animate-scale-in">
        
        {/* Animated Spinner with Glow */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 dark:bg-indigo-500/30 blur-xl animate-pulse" />
          <div className="w-20 h-20 border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-indigo-600 dark:text-indigo-400 animate-bounce" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        {/* Live Multi-Key Pool Telemetry Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Multi-API Key Pool Allocator</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>IN-FLIGHT CONCURRENCY</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Allocated Slot:</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block flex items-center space-x-1">
                <Key className="h-3 w-3 text-indigo-500 inline" />
                <span>{keySlot || 'Key 1 (Pre-Warmed)'}</span>
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Active Model Fleet:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate block">
                {activeModel}
              </span>
            </div>
          </div>

          {engineInfo && (
            <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center space-x-1.5 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>{engineInfo}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
            <span>Semantic Resume Evaluation</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center space-x-2 pt-1">
          {[0, 1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                progress >= (step + 1) * 20
                  ? 'w-6 bg-indigo-600 dark:bg-indigo-500'
                  : progress >= step * 20
                  ? 'w-4 bg-indigo-400/50'
                  : 'w-2 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

export default LoadingOverlay;