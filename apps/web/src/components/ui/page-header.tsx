import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className = '' }: PageHeaderProps): JSX.Element {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-slate-600 sm:text-xl max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
