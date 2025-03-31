import React from 'react';
import styles from './Avatar.module.css';

export type AvatarSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
export type AvatarShape = 'circle' | 'square';

export interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    shape?: AvatarShape;
    className?: string;
    status?: 'online' | 'offline' | 'busy' | 'away';
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = '',
    name,
    size = 'medium',
    shape = 'circle',
    className = '',
    status,
}) => {
    const classes = `
        ${styles.avatar} 
        ${styles[size]} 
        ${styles[shape]} 
        ${className}
    `.trim();

    // Generate initials from name
    const initials = name
        ? name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        : '';

    return (
        <div className={styles.container}>
            <div className={classes}>
                {src ? (
                    <img src={src} alt={alt} className={styles.image} />
                ) : (
                    <div className={styles.initials}>{initials}</div>
                )}
            </div>
            {status && <span className={`${styles.status} ${styles[status]}`} />}
        </div>
    );
};
