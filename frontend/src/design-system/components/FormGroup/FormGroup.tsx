import React from 'react';
import styles from './FormGroup.module.css';

export interface FormGroupProps {
    children: React.ReactNode;
    label?: React.ReactNode;
    helperText?: string;
    error?: string;
    required?: boolean;
    className?: string;
    direction?: 'vertical' | 'horizontal';
}

export const FormGroup: React.FC<FormGroupProps> = ({
    children,
    label,
    helperText,
    error,
    required = false,
    className = '',
    direction = 'vertical',
}) => {
    const groupId = `form-group-${Math.random().toString(36).substring(2, 9)}`;

    const classes = `
    ${styles.formGroup}
    ${styles[direction]}
    ${error ? styles.hasError : ''}
    ${className}
  `.trim();

    return (
        <div className={classes}>
            {label && (
                <div className={styles.labelContainer}>
                    <label htmlFor={groupId} className={styles.label}>
                        {label}
                        {required && <span className={styles.required}>*</span>}
                    </label>
                </div>
            )}

            <div className={styles.content}>
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                            id: child.props.id || groupId,
                            required: child.props.required !== undefined ? child.props.required : required,
                            'aria-describedby': helperText ? `${groupId}-helper` : undefined,
                            'aria-invalid': !!error,
                            ...child.props,
                        });
                    }
                    return child;
                })}

                {(error || helperText) && (
                    <div
                        id={`${groupId}-helper`}
                        className={error ? styles.error : styles.helperText}
                    >
                        {error || helperText}
                    </div>
                )}
            </div>
        </div>
    );
};
