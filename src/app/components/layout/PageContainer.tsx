import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
}

export function PageContainer({ 
  children, 
  className = '', 
  backgroundColor = 'bg-gray-50',
  maxWidth = '2xl'
}: PageContainerProps) {
  const maxWidthClasses = {
    'sm': 'max-w-sm lg:max-w-7xl',
    'md': 'max-w-md lg:max-w-7xl',
    'lg': 'max-w-lg lg:max-w-7xl',
    'xl': 'max-w-xl lg:max-w-7xl',
    '2xl': 'max-w-2xl lg:max-w-7xl',
    '7xl': 'max-w-7xl',
  };

  return (
    <div className={`pb-32 lg:pb-8 pt-24 lg:pt-16 px-4 lg:pl-[320px] ${maxWidthClasses[maxWidth]} mx-auto min-h-screen ${backgroundColor} ${className}`}>
      {children}
    </div>
  );
}