import React from 'react';
import { Radio, RadioProps } from '../Radio/Radio';
import styles from './RadioGroup.module.css';

export interface RadioOption {
    value: string;
    label: React.ReactNode;
    disabled?: boolean;
}

export interface RadioGroupProps {
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    name: string;
    label?: React.ReactNode;
    error?: string;
    direction?: 'horizontal' | 'vertical';
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
    options,
    value,
    onChange,
    name,
    label,
    error,
    direction = 'vertical',
    size = 'medium',
    className = '',
}) => {
    const containerClasses = `
        ${styles.container}
        ${className}
    `.trim();

    const groupClasses = `
        ${styles.group}
        ${styles[direction]}
    `.trim();

    return (
        <div className={containerClasses}>
            {label && <div className={styles.label}>{label}</div>}

            <div className={groupClasses}>
                {options.map((option) => (
                    <Radio
                        key={option.value}
                        name={name}
                        value={option.value}
                        label={option.label}
                        checked={value === option.value}
                        onChange={onChange}
                        disabled={option.disabled}
                        size={size}
                    />
                ))}
            </div>

            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};
