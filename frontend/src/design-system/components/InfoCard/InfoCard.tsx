import React from 'react';
import styles from './InfoCard.module.css';

export interface InfoCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, children, className }) => {
    return (
        <div className={`${styles.infoCard} ${className || ''}`}>
            <h3 className={styles.infoTitle}>{title}</h3>
            {children}
        </div>
    );
};
