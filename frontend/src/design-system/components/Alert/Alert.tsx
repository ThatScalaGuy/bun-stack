import React from 'react';
import styles from './Alert.module.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
    variant?: AlertVariant;
    title?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    onClose?: () => void;
    className?: string;
}

export const Alert: React.FC<AlertProps> = ({
    variant = 'info',
    title,
    children,
    icon,
    onClose,
    className = '',
}) => {
    const classes = `
        ${styles.alert} 
        ${styles[variant]} 
        ${className}
    `.trim();

    return (
        <div className={classes} role="alert">
            {icon && <div className={styles.icon}>{icon}</div>}
            <div className={styles.content}>
                {title && <div className={styles.title}>{title}</div>}
                <div className={styles.message}>{children}</div>
            </div>
            {onClose && (
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close alert"
                >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.closeIcon}>
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
        </div>
    );
};
