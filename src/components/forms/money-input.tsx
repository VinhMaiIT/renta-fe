'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';

const groupFormatter = new Intl.NumberFormat('vi-VN');

interface MoneyInputProps {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  value: number | null | undefined;
  onChange: (value: number) => void;
  onBlur?: () => void;
}

/**
 * Numeric money field. While focused it shows the raw number for easy typing;
 * on blur it shows a grouped value (e.g. 500.000) so the user can sanity-check.
 */
export function MoneyInput({ value, onChange, onBlur, ...rest }: MoneyInputProps) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');

  const numeric = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  const display = editing ? raw : groupFormatter.format(numeric);

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={display}
      onFocus={() => {
        setEditing(true);
        setRaw(numeric ? String(numeric) : '');
      }}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '');
        setRaw(digits);
        onChange(digits ? Number(digits) : 0);
      }}
      onBlur={() => {
        setEditing(false);
        onBlur?.();
      }}
      {...rest}
    />
  );
}
