import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
<<<<<<< HEAD
      className={`rounded-xl shimmer border border-institutional-100 dark:border-institutional-800 ${className}`}
=======
      className={`animate-pulse rounded-sm bg-gold/5 border border-gold/10 ${className}`}
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
      {...props}
    />
  );
};

export { Skeleton };
