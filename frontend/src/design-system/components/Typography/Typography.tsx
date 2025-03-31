import React from 'react';
import styles from './Typography.module.css';

export type TypographyVariant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'subtitle1'
    | 'subtitle2'
    | 'body1'
    | 'body2'
    | 'caption'
    | 'overline'
    | 'code';

export interface TypographyProps {
    variant?: TypographyVariant;
    component?: React.ElementType;
    align?: 'left' | 'center' | 'right';
    color?: 'default' | 'primary' | 'secondary' | 'light';
    gutterBottom?: boolean;
    noWrap?: boolean;
    className?: string;
    children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'body1',
    component,
    align = 'left',
    color = 'default',
    gutterBottom = false,
    noWrap = false,
    className = '',
    children,
    ...props
}) => {
    // Determine which HTML element to use
    const Component = component || defaultComponents[variant] || 'p';

    const classes = `
        ${styles.typography}
        ${styles[variant]}
        ${styles[`align-${align}`]}
        ${styles[`color-${color}`]}
        ${gutterBottom ? styles.gutterBottom : ''}
        ${noWrap ? styles.noWrap : ''}
        ${className}
    `.trim();

    return (
        <Component className={classes} {...props}>
            {children}
        </Component>
    );
};

// Default mapping of variant to HTML element
const defaultComponents: Record<TypographyVariant, React.ElementType> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    subtitle1: 'h6',
    subtitle2: 'h6',
    body1: 'p',
    body2: 'p',
    caption: 'span',
    overline: 'span',
    code: 'code'
};
