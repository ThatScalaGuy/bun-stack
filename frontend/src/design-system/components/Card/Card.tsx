import React, { forwardRef } from 'react';
import styles from './Card.module.css';

export type CardVariant = 'default' | 'outline' | 'elevated';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant;
    className?: string;
    children: React.ReactNode;
    clickable?: boolean;
    onClick?: () => void;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ variant = 'default', className = '', children, clickable, onClick, ...props }, ref) => {
        const classes = `
            ${styles.card} 
            ${styles[variant]} 
            ${clickable ? styles.clickable : ''}
            ${className}
        `.trim();

        return (
            <div ref={ref} className={classes} onClick={onClick} {...props}>
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
