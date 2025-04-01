import React from 'react';
import styles from './InfoList.module.css';

export interface InfoListProps {
    items: React.ReactNode[];
    className?: string;
}

export const InfoList: React.FC<InfoListProps> = ({ items, className }) => {
    return (
        <ul className={`${styles.infoList} ${className || ''}`}>
            {items.map((item, index) => (
                <li key={index} className={styles.infoItem}>
                    {item}
                </li>
            ))}
        </ul>
    );
};
