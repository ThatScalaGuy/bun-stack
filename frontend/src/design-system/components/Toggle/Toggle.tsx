import React, { forwardRef } from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    className?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
    ({ label, checked, onChange, size = 'medium', disabled = false, className = '', id, ...props }, ref) => {
        const toggleId = id || `toggle-${Math.random().toString(36).substring(2, 9)}`;

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.checked);
        };

        const classes = `
            ${styles.toggleContainer}
            ${styles[size]}
            ${disabled ? styles.disabled : ''}
            ${className}
        `.trim();

        return (
            <div className={classes}>
                <label htmlFor={toggleId} className={styles.label}>
                    <input
                        ref={ref}
                        id={toggleId}
                        type="checkbox"
                        checked={checked}
                        onChange={handleChange}
                        disabled={disabled}
                        className={styles.input}
                        {...props}
                    />
                    <span className={styles.toggle}>
                        <span className={styles.slider} />
                    </span>
                    {label && <span className={styles.labelText}>{label}</span>}
                </label>
            </div>
        );
    }
);

Toggle.displayName = 'Toggle';
