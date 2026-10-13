import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-500 ${className}`}>
      <ol className="flex items-center space-x-1.5">
        <li className="flex items-center">
          <a
            href="/"
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors"
            title="Chikitsaalye Home"
          >
            <Home className="w-3.5 h-3.5" />
          </a>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center space-x-1.5">
            <ChevronRight className="w-3 h-3 text-slate-400" />
            {item.current || !item.href ? (
              <span className="font-semibold text-slate-800" aria-current={item.current ? 'page' : undefined}>
                {item.label}
              </span>
            ) : (
              <a href={item.href} className="hover:text-slate-900 transition-colors">
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
