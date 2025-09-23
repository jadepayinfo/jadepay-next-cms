import { cn } from '@/lib/css';
import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const ButtonFill: React.FC<Props> = (props) => {
  const { size = 'sm', children, ...buttonProps } = props;
  const buttonSize = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  };

  return (
    <button
      {...buttonProps}
      className={cn(
        'btn btn-primary text-[--bt-text] normal-case',
        buttonSize[size],
        props.className
      )}
    >
      {children}
    </button>
  );
};
export default ButtonFill;
