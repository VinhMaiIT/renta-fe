import { forwardRef, type ComponentProps } from 'react';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { FormLabel } from '@/components/ui/form-label';
import { FormErrorMessage } from '@/components/ui/form-error-message';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<ComponentProps<'select'>, 'size'> {
  label?: string;
  required?: boolean;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

/**
 * Labeled native select with error display. Spread `register(name)` onto it for
 * React Hook Form, or use it controlled via `value`/`onChange`.
 */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, required, error, options, placeholder, id, className, ...props },
  ref,
) {
  return (
    <div className="w-full">
      {label ? <FormLabel label={label} htmlFor={id} required={required} /> : null}
      <NativeSelect ref={ref} id={id} aria-invalid={!!error} className="w-full" {...props}>
        {placeholder ? <NativeSelectOption value="">{placeholder}</NativeSelectOption> : null}
        {options.map((opt) => (
          <NativeSelectOption key={opt.value} value={opt.value}>
            {opt.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {error ? <FormErrorMessage error={error} /> : null}
    </div>
  );
});
