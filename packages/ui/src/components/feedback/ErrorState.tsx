import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../forms/Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  requestId?: string;
  errorCode?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Application Encountered an Error',
  message,
  requestId,
  errorCode,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-rose-50/50 border border-rose-200 rounded-lg ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4 ring-4 ring-rose-50">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-600 mt-1 max-w-md">{message}</p>

      {(errorCode || requestId) && (
        <div className="mt-3 flex items-center space-x-2 text-[10px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200">
          {errorCode && <span>Code: {errorCode}</span>}
          {errorCode && requestId && <span>•</span>}
          {requestId && <span>Trace: {requestId}</span>}
        </div>
      )}

      {onRetry && (
        <div className="mt-5">
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};
