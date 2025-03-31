import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
    className?: string;
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'medium',
    className = '',
    closeOnEscape = true,
    closeOnOutsideClick = true,
}) => {
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (closeOnEscape && isOpen && event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);

        // Prevent body scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, closeOnEscape, onClose]);

    const handleBackdropClick = (event: React.MouseEvent) => {
        if (closeOnOutsideClick && event.target === event.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div
                className={`${styles.modal} ${styles[size]} ${className}`}
                role="dialog"
                aria-modal="true"
            >
                <div className={styles.header}>
                    {title && <div className={styles.title}>{title}</div>}
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.closeIcon}>
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <div className={styles.content}>
                    {children}
                </div>
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>,
        document.body
    );
};
