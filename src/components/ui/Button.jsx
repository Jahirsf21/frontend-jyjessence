import React from 'react';

const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  success: 'bg-green-600 text-white hover:bg-green-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  info: 'bg-blue-600 text-white hover:bg-blue-700',
  light: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
};

const SIZES = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base'
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  block = false,
  as: As = 'button',
  ...props
}) {
  const base = 'rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
  const classes = [
    base,
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    block ? 'w-full' : '',
    className
  ].join(' ').trim();

 
  return (
    <As className={classes} {...props}>
      {children}
    </As>
  );
}
