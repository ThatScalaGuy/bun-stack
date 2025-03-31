import React, { forwardRef } from 'react';
import { Link } from 'react-router';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    isLoading?: boolean;
    href?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'medium',
            fullWidth = false,
            isLoading = false,
            href,
            icon,
            iconPosition = 'left',
            children,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        const classes = `
      ${styles.button} 
      ${styles[variant]} 
      ${styles[size]} 
      ${fullWidth ? styles.fullWidth : ''} 
      ${isLoading ? styles.loading : ''} 
      ${className}
    `.trim();

        const content = (
            <>
                {isLoading && <span className={styles.spinner} aria-hidden="true" />}

                {icon && iconPosition === 'left' && !isLoading && (
                    <span className={styles.iconLeft}>{icon}</span>
                )}

                <span className={isLoading ? styles.invisible : ''}>{children}</span>

                {icon && iconPosition === 'right' && !isLoading && (
                    <span className={styles.iconRight}>{icon}</span>
                )}
            </>
        );

        if (href) {
            return (
                <Link to={href} className={classes} aria-disabled={disabled || isLoading}>
                    {content}
                </Link>
            );
        }

        return (
            <button
                ref={ref}
                className={classes}
                disabled={disabled || isLoading}
                {...props}
            >
                {content}
            </button>
        );
    }
);

Button.displayName = 'Button';
