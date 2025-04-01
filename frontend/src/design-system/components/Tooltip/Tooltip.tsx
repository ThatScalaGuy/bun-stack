import React, { useState } from 'react';
import styles from './Tooltip.module.css';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
    content: React.ReactNode;
    position?: TooltipPosition;
    delay?: number;
    className?: string;
    children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    position = 'top',
    delay = 400,
    className = '',
    children
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<Timer | null>(null);

    const handleMouseEnter = () => {
        const id = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setIsVisible(false);
    };

    // Clone the child component to add mouse event handlers
    const childWithEvents = React.cloneElement(children, {
        onMouseEnter: (e: React.MouseEvent) => {
            handleMouseEnter();
            // Call the original handler if it exists
            if (children.props.onMouseEnter) {
                children.props.onMouseEnter(e);
            }
        },
        onMouseLeave: (e: React.MouseEvent) => {
            handleMouseLeave();
            // Call the original handler if it exists
            if (children.props.onMouseLeave) {
                children.props.onMouseLeave(e);
            }
        },
    });

    const tooltipClasses = `
        ${styles.tooltip}
        ${styles[position]}
        ${isVisible ? styles.visible : ''}
        ${className}
    `.trim();

    return (
        <div className={styles.container}>
            {childWithEvents}
            <div className={tooltipClasses} role="tooltip">
                <div className={styles.content}>{content}</div>
                <div className={styles.arrow} />
            </div>
        </div>
    );
};
