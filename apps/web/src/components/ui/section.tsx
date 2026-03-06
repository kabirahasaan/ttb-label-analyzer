import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function Section({
  children,
  className = '',
  title,
  description,
}: SectionProps): JSX.Element {
  return (
    <section className={`space-y-6 ${className}`}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
          )}
          {description && <p className="text-lg text-slate-600 max-w-3xl">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
