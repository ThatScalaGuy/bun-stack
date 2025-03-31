import React, { forwardRef, useState, useRef } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import styles from './Select.module.css';

export interface SelectOption {
    value: string;
    label: React.ReactNode;
    disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'size'> {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    label?: React.ReactNode;
    placeholder?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    size?: 'small' | 'medium' | 'large';
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    className?: string;
    variant?: 'outlined' | 'filled';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({
        options,
        value,
        onChange,
        label,
        placeholder,
        error,
        helperText,
        fullWidth = false,
        size = 'medium',
        startIcon,
        endIcon,
        className = '',
        disabled = false,
        variant = 'outlined',
        id,
        required,
        ...props
    }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const containerRef = useRef<HTMLDivElement>(null);
        const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;

        useOnClickOutside(containerRef, () => setIsOpen(false));

        const handleToggle = () => {
            if (!disabled) {
                setIsOpen(!isOpen);
            }
        };

        const handleOptionClick = (option: SelectOption) => {
            if (!option.disabled) {
                onChange(option.value);
                setIsOpen(false);
            }
        };

        const selectedOption = options.find(option => option.value === value);

        const containerClasses = `
            ${styles.container}
            ${fullWidth ? styles.fullWidth : ''}
            ${disabled ? styles.disabled : ''}
            ${error ? styles.error : ''}
            ${styles[size]}
            ${styles[variant]}
            ${className}
        `.trim();

        const dropdownClasses = `
            ${styles.dropdown}
            ${isOpen ? styles.open : ''}
        `.trim();

        return (
            <div className={containerClasses} ref={containerRef}>
                {label && (
                    <label htmlFor={selectId} className={styles.label}>
                        {label}
                        {required && <span className={styles.required}>*</span>}
                    </label>
                )}

                <div className={styles.selectWrapper} onClick={handleToggle}>
                    {startIcon && <span className={styles.startIcon}>{startIcon}</span>}

                    <div className={styles.value}>
                        {selectedOption ? (
                            selectedOption.label
                        ) : (
                            <span className={styles.placeholder}>{placeholder || 'Select an option'}</span>
                        )}
                    </div>

                    <span className={styles.arrow}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d={isOpen ? "M7 15l5-5 5 5" : "M7 10l5 5 5-5"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>

                    {endIcon && <span className={styles.endIcon}>{endIcon}</span>}

                    {/* Hidden native select for accessibility and form submission */}
                    <select
                        ref={ref}
                        id={selectId}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        required={required}
                        className={styles.nativeSelect}
                        aria-invalid={!!error}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value} disabled={option.disabled}>
                                {typeof option.label === 'string' ? option.label : 'Option'}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={dropdownClasses}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`
                                ${styles.option}
                                ${option.value === value ? styles.selected : ''}
                                ${option.disabled ? styles.disabled : ''}
                            `}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option.label}
                        </div>
                    ))}
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

Select.displayName = 'Select';
