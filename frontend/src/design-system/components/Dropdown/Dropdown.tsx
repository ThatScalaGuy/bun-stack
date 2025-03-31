import React, { useState, useRef } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import styles from './Dropdown.module.css';

export interface DropdownItem {
    id: string;
    label: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

export interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    width?: number | string;
    className?: string;
    disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    items,
    position = 'bottom-left',
    width = 'auto',
    className = '',
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(containerRef, () => setIsOpen(false));

    const handleTriggerClick = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleItemClick = (item: DropdownItem) => {
        if (!item.disabled && item.onClick) {
            item.onClick();
        }
        setIsOpen(false);
    };

    const containerClasses = `
        ${styles.container}
        ${disabled ? styles.disabled : ''}
        ${className}
    `.trim();

    const menuClasses = `
        ${styles.menu}
        ${styles[position]}
        ${isOpen ? styles.open : ''}
    `.trim();

    return (
        <div className={containerClasses} ref={containerRef}>
            <div className={styles.trigger} onClick={handleTriggerClick}>
                {trigger}
            </div>

            <div className={menuClasses} style={{ width }}>
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`${styles.item} ${item.disabled ? styles.disabled : ''}`}
                        onClick={() => !item.disabled && handleItemClick(item)}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
};
