import React from 'react';
import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    children: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    size = 'medium',
    children,
    icon,
    className = '',
}) => {
    const classes = `
        ${styles.badge} 
        ${styles[variant]} 
        ${styles[size]} 
        ${className}
    `.trim();

    return (
        <span className={classes}>
            {icon && <span className={styles.icon}>{icon}</span>}
            <span className={styles.content}>{children}</span>
        </span>
    );
};
