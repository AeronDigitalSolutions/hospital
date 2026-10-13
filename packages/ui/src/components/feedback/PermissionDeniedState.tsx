import React from 'react';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '../forms/Button';

export interface PermissionDeniedStateProps {
  requiredPermission?: string;
  moduleName?: string;
  onBack?: () => void;
  className?: string;
}

export const PermissionDeniedState: React.FC<PermissionDeniedStateProps> = ({
  requiredPermission,
  moduleName = 'this department',
  onBack,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-amber-50/40 border border-amber-200 rounded-lg ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4 ring-4 ring-amber-50">
        <ShieldX className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">Access Restricted by Clinical Governance</h3>
      <p className="text-xs text-slate-600 mt-1 max-w-md">
        Your active role does not possess authorization to view or execute operations in {moduleName}.
      </p>

      {requiredPermission && (
        <div className="mt-3 text-[11px] font-mono text-amber-800 bg-amber-100/70 px-3 py-1 rounded border border-amber-200">
          Required Permission: <span className="font-bold">{requiredPermission}</span>
        </div>
      )}

      {onBack && (
        <div className="mt-5">
          <Button onClick={onBack} size="sm" variant="secondary">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Return to Authorized Ward
          </Button>
        </div>
      )}
    </div>
  );
};
