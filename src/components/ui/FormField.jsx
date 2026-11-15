import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function FormField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder = '',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  autoComplete,
  options = [],
  rows = 3,
  as = 'input',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const baseControlClasses = [
    'w-full rounded-lg border bg-white text-[#172554] placeholder:text-slate-400 transition-colors duration-150',
    'text-base sm:text-sm',
    as === 'textarea' ? 'px-3.5 py-2.5' : 'min-h-[44px] px-3.5 py-2.5',
    isPassword ? 'pr-12' : '',
    error
      ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/15'
      : 'border-slate-300 hover:border-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15',
    'focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
  ].join(' ');

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[#172554]"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      </div>

      <div className="relative">
        {as === 'select' ? (
          <select
            id={id}
            name={name || id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-hint` : undefined}
            className={baseControlClasses}
          >
            {options.map((option) => {
              const optValue = typeof option === 'string' ? option : option.value;
              const optLabel = typeof option === 'string' ? option : option.label;
              return (
                <option key={optValue} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        ) : as === 'textarea' ? (
          <textarea
            id={id}
            name={name || id}
            rows={rows}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-hint` : undefined}
            className={baseControlClasses}
          />
        ) : (
          <input
            id={id}
            name={name || id}
            type={resolvedType}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-hint` : undefined}
            className={baseControlClasses}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex min-w-[44px] items-center justify-center text-[#64748B] hover:text-[#172554] cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-red-700"
        >
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={`${id}-hint`} className="text-xs text-[#64748B]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
