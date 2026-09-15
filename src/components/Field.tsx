import type { ChangeEvent } from 'react';
import './Field.scss';

type FieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  testId: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'numeric' | 'text';
};

export function Field({
  label,
  value,
  onChange,
  testId,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
}: FieldProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input
        data-testid={testId}
        className="field__input"
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
      />
    </label>
  );
}
