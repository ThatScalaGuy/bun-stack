import React from 'react';
import styles from './Divider.module.css';

export interface DividerProps {
    orientation?: 'horizontal' | 'vertical';
    variant?: 'solid' | 'dashed' | 'dotted';
    spacing?: 'none' | 'small' | 'medium' | 'large';
    label?: React.ReactNode;
    className?: string;
}

export const Divider: React.FC<DividerProps> = ({
    orientation = 'horizontal',
    variant = 'solid',
    spacing = 'medium',
    label,
    className = '',
}) => {
    const classes = `
    ${styles.divider}
    ${styles[orientation]}
    ${styles[variant]}
    ${spacing !== 'none' ? styles[`spacing-${spacing}`] : ''}
    ${label ? styles.withLabel : ''}
    ${className}
  `.trim();

    return (
        <div className={classes} role="separator">
            {label && <span className={styles.label}>{label}</span>}
        </div>
    );
};
