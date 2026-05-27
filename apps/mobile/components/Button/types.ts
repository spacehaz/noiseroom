export interface ButtonProps {
  title: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
}
