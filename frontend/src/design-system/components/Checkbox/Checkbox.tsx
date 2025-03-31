import React, { forwardRef } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React.ReactNode;
    checked: boolean;
    onChange: (checked: boolean) => void;
    indeterminate?: boolean;
    size?: 'small' | 'medium' | 'large';
    error?: string;
    className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({
        label,
        checked,
        onChange,
        indeterminate = false,
        size = 'medium',
        error,
        className = '',
        id,
        disabled = false,
        ...props
    }, ref) => {
        const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.checked);
        };

        // Handle the ref to set indeterminate property
        const combinedRef = (node: HTMLInputElement | null) => {
            if (node) {
                node.indeterminate = indeterminate;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            }
        };

        const containerClasses = `
            ${styles.container}
            ${disabled ? styles.disabled : ''}
            ${error ? styles.hasError : ''}
            ${className}
        `.trim();

        return (
            <div className={containerClasses}>
                <label htmlFor={checkboxId} className={styles.label}>
                    <input
                        ref={combinedRef}
                        id={checkboxId}
                        type="checkbox"
                        checked={checked}
                        onChange={handleChange}
                        disabled={disabled}
                        className={`${styles.input} ${styles[size]}`}
                        {...props}
                    />
                    <span className={styles.checkbox}>
                        <svg
                            className={styles.icon}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {indeterminate ? (
                                <path
                                    d="M5 12h14"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            ) : (
                                <path
                                    d="M5 13l4 4L19 7"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}
                        </svg>
                    </span>
                    {label && <span className={styles.labelText}>{label}</span>}
                </label>
                {error && <div className={styles.errorText}>{error}</div>}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';
