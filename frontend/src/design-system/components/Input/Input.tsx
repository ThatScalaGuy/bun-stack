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
        ...props
    }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

        const classes = `
      ${styles.inputContainer}
      ${styles[variant]}
      ${styles[size]}
      ${fullWidth ? styles.fullWidth : ''}
      ${error ? styles.error : ''}
      ${className}
    `.trim();

        return (
            <div className={classes}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}

                <div className={styles.inputWrapper}>
                    {startIcon && <div className={styles.startIcon}>{startIcon}</div>}

                    <input
                        ref={ref}
                        id={inputId}
                        className={styles.input}
                        aria-invalid={!!error}
                        {...props}
                    />

                    {endIcon && <div className={styles.endIcon}>{endIcon}</div>}
                </div>

                {(error || helperText) && (
                    <div className={error ? styles.errorText : styles.helperText}>
                        {error || helperText}
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
