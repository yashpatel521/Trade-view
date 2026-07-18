import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        "bg-[#141414] border border-[#222] rounded-xl p-6 transition-all duration-200",
        hoverEffect && "hover:border-neutral-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
