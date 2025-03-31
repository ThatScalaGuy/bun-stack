import React from 'react';
import styles from './Spinner.module.css';

export type SpinnerSize = 'small' | 'medium' | 'large';
export type SpinnerColor = 'primary' | 'secondary' | 'white';

export interface SpinnerProps {
    size?: SpinnerSize;
    color?: SpinnerColor;
    className?: string;
    label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'medium',
    color = 'primary',
    className = '',
    label,
}) => {
    const classes = `
        ${styles.spinner} 
        ${styles[size]} 
        ${styles[color]} 
        ${className}
    `.trim();

    return (
        <div className={styles.container}>
            <div className={classes} aria-label={label || 'Loading'} role="status" />
            {label && <div className={styles.label}>{label}</div>}
        </div>
    );
};
