import React, { useState } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
    id: string;
    label: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
}

export interface TabsProps {
    tabs: TabItem[];
    defaultTabId?: string;
    onChange?: (tabId: string) => void;
    variant?: 'default' | 'pills' | 'underlined';
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
    tabs,
    defaultTabId,
    onChange,
    variant = 'default',
    className = '',
}) => {
    const [activeTabId, setActiveTabId] = useState<string>(defaultTabId || tabs[0]?.id || '');

    const handleTabClick = (tabId: string) => {
        setActiveTabId(tabId);
        if (onChange) {
            onChange(tabId);
        }
    };

    const activeTab = tabs.find((tab) => tab.id === activeTabId);

    return (
        <div className={`${styles.tabsContainer} ${className}`}>
            <div className={`${styles.tabList} ${styles[variant]}`} role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`
                            ${styles.tab} 
                            ${activeTabId === tab.id ? styles.activeTab : ''}
                            ${tab.disabled ? styles.disabledTab : ''}
                        `}
                        onClick={() => !tab.disabled && handleTabClick(tab.id)}
                        role="tab"
                        aria-selected={activeTabId === tab.id}
                        aria-disabled={tab.disabled}
                        tabIndex={activeTabId === tab.id ? 0 : -1}
                        id={`tab-${tab.id}`}
                        aria-controls={`panel-${tab.id}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div
                className={styles.tabPanel}
                role="tabpanel"
                id={`panel-${activeTabId}`}
                aria-labelledby={`tab-${activeTabId}`}
            >
                {activeTab?.content}
            </div>
        </div>
    );
};
