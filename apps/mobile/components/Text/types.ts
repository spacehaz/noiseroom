import { ReactNode } from 'react';

export interface TextProps {
  children: ReactNode;
  muted?: boolean;
  error?: boolean;
  size?: 'xs' | 'sm' | 'md';
}
