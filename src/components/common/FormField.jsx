import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  options = [], // Para type="select": array de { value, label }
  rows = 3, // Para type="textarea"
  className = '',
  ...props
}) {
  const inputBaseClass = `w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all focus:outline-none focus:ring-1 ${
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
  } disabled:opacity-50 disabled:bg-slate-900/50`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-emerald-400">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={inputBaseClass}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={inputBaseClass}
          {...props}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputBaseClass}
          {...props}
        />
      )}

      {error ? (
        <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
          <AlertCircle size={13} />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
