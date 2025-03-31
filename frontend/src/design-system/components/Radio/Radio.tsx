import React, { forwardRef } from 'react';
import styles from './Radio.module.css';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    label?: React.ReactNode;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
    size?: 'small' | 'medium' | 'large';
    error?: string;
    className?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
    ({
        label,
        value,
        checked,
        onChange,
        size = 'medium',
        error,
        className = '',
        id,
        disabled = false,
        ...props
    }, ref) => {
        const radioId = id || `radio-${Math.random().toString(36).substring(2, 9)}`;

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value);
        };

        const containerClasses = `
            ${styles.container}
            ${disabled ? styles.disabled : ''}
            ${error ? styles.hasError : ''}
            ${className}
        `.trim();

        return (
            <div className={containerClasses}>
                <label htmlFor={radioId} className={styles.label}>
                    <input
                        ref={ref}
                        id={radioId}
                        type="radio"
                        value={value}
                        checked={checked}
                        onChange={handleChange}
                        disabled={disabled}
                        className={`${styles.input} ${styles[size]}`}
                        {...props}
                    />
                    <span className={styles.radio}>
                        <span className={styles.dot} />
                    </span>
                    {label && <span className={styles.labelText}>{label}</span>}
                </label>
                {error && <div className={styles.errorText}>{error}</div>}
            </div>
        );
    }
);

Radio.displayName = 'Radio';
