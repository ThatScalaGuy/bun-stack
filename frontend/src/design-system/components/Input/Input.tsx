import React, { forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    helperText?: string;
    variant?: 'outlined' | 'filled';
    size?: 'small' | 'medium' | 'large';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
        label,
        error,
        fullWidth = false,
        startIcon,
        endIcon,
        helperText,
        variant = 'outlined',
        size = 'medium',
        className = '',
        id,
        required,
        type = 'text',
        ...props
    }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

        const containerClasses = `
      ${styles.container}
      ${fullWidth ? styles.fullWidth : ''}
      ${error ? styles.hasError : ''}
      ${styles[variant]}
      ${styles[size]}
      ${className}
    `.trim();

        return (
            <div className={containerClasses}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                        {required && <span className={styles.required}>*</span>}
                    </label>
                )}

                <div className={styles.inputWrapper}>
                    {startIcon && <span className={styles.startIcon}>{startIcon}</span>}

                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        className={styles.input}
                        aria-invalid={!!error}
                        aria-describedby={
                            error || helperText ? `${inputId}-helper` : undefined
                        }
                        required={required}
                        {...props}
                    />

                    {endIcon && <span className={styles.endIcon}>{endIcon}</span>}
                </div>

                {(error || helperText) && (
                    <div
                        id={`${inputId}-helper`}
                        className={error ? styles.errorText : styles.helperText}
                    >
                        {error || helperText}
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
