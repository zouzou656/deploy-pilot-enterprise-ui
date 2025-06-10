// src/components/ui/spinner.tsx

import React from 'react';

interface SpinnerProps {
  /** Tailwind‐style size (e.g. "h-5 w-5" or "h-10 w-10") */
  sizeClassName?: string;
  /** Border width (e.g. "border-2" or "border-4") */
  borderWidthClassName?: string;
  /** Color for the “top” border (e.g. "border-t-blue-500") */
  topBorderColorClassName?: string;
  /** Color for the other borders (e.g. "border-gray-300") */
  borderColorClassName?: string;
  /** Any additional Tailwind classes */
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  sizeClassName = 'h-5 w-5',
  borderWidthClassName = 'border-2',
  topBorderColorClassName = 'border-t-blue-500',
  borderColorClassName = 'border-gray-300',
  className = '',
}) => {
  return (
    <div
      className={`
        animate-spin
        ${sizeClassName}
        ${borderWidthClassName}
        ${topBorderColorClassName}
        ${borderColorClassName}
        rounded-full
        ${className}
      `}
    />
  );
};

export default Spinner;
