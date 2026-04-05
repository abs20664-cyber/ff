import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={`rounded-xl shimmer border border-institutional-100 dark:border-institutional-800 ${className}`}
      {...props}
    />
  );
};

export { Skeleton };
