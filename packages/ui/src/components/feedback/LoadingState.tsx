import React from 'react';
import { Loader2, HeartPulse } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  variant?: 'spinner' | 'pulse' | 'skeleton';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading clinical data...',
  subMessage = 'Querying hospital repository...',
  variant = 'pulse',
  className = '',
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={`w-full p-6 space-y-4 animate-pulse ${className}`}>
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      {variant === 'pulse' ? (
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4 ring-8 ring-blue-50/50">
          <HeartPulse className="w-6 h-6 animate-pulse" />
        </div>
      ) : (
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
      )}
      <h3 className="text-sm font-semibold text-slate-800">{message}</h3>
      {subMessage && <p className="text-xs text-slate-500 mt-1 max-w-sm">{subMessage}</p>}
    </div>
  );
};
