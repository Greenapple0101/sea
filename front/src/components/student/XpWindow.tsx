import { ReactNode } from 'react';
import clsx from 'clsx';

interface XpWindowProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  controls?: boolean;
}

export function XpWindow({
  title,
  children,
  className,
  bodyClassName,
  controls = true,
}: XpWindowProps) {
  return (
    <div className={clsx('window', className)}>
      {title && (
        <div className="title-bar">
          <div className="title-bar-text">{title}</div>
          {controls && (
            <div className="title-bar-controls">
              <button aria-label="Minimize" />
              <button aria-label="Maximize" />
              <button aria-label="Close" />
            </div>
          )}
        </div>
      )}
      <div className={clsx('window-body', bodyClassName)}>{children}</div>
    </div>
  );
}

