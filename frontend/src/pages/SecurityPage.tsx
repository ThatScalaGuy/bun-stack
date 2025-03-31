import { useState } from 'react';
import { MultiFactorAuth } from '../components/auth/MultiFactorAuth';
import { ChangePasswordForm } from '../components/user/ChangePasswordForm';
import styles from './SecurityPage.module.css';

export const SecurityPage = () => {
    const [activeTab, setActiveTab] = useState<'password' | 'mfa'>('password');

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Security Settings</h1>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'password' ? styles.active : ''}`}
                    onClick={() => setActiveTab('password')}
                >
                    Password
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'mfa' ? styles.active : ''}`}
                    onClick={() => setActiveTab('mfa')}
                >
                    Two-Factor Authentication
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'password' ? (
                    <ChangePasswordForm />
                ) : (
                    <MultiFactorAuth />
                )}
            </div>
        </div>
    );
};
