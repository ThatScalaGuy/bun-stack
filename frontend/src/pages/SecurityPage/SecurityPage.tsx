import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useProfileQueries, useMfaQueries } from '../../hooks/queries';
import styles from './SecurityPage.module.css';
import { Button } from '../../design-system';
import { PageHeader } from '../../design-system/components';

type ChangePasswordFormData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

type MfaSetupFormData = {
    password: string;
};

export const SecurityPage = () => {
    const { user } = useAuth();
    const { changePassword } = useProfileQueries();
    const { setupMfa, verifyMfa, disableMfa: removeMfa } = useMfaQueries();

    const [mfaSetupData, setMfaSetupData] = useState<{
        secret: string;
        qrCodeUrl: string;
        mfaId: string;
    } | null>(null);
    const [step, setStep] = useState<'password' | 'setup' | 'verify'>('password');
    const [verificationCode, setVerificationCode] = useState('');

    // Change password form
    const {
        register: passwordRegister,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPasswordForm,
    } = useForm<ChangePasswordFormData>();

    // MFA setup form
    const {
        register: mfaRegister,
        handleSubmit: handleMfaSubmit,
        formState: { errors: mfaErrors },
    } = useForm<MfaSetupFormData>();

    const onChangePasswordSubmit = (data: ChangePasswordFormData) => {
        if (data.newPassword !== data.confirmPassword) {
            // Show error notification
            return;
        }
        changePassword.mutate(
            {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            },
            {
                onSuccess: () => {
                    resetPasswordForm();
                    // Show success notification
                },
            }
        );
    };

    const onSetupMfaSubmit = (data: MfaSetupFormData) => {
        setupMfa.mutate(
            { password: data.password },
            {
                onSuccess: (data) => {
                    setMfaSetupData({
                        secret: data.secret,
                        qrCodeUrl: data.qrCodeUrl,
                        mfaId: data.mfaId,
                    });
                    setStep('setup');
                },
            }
        );
    };

    const onVerifyMfaSubmit = () => {
        if (!mfaSetupData) return;
        verifyMfa.mutate(
            {
                mfaId: mfaSetupData.mfaId,
                code: verificationCode,
            },
            {
                onSuccess: () => {
                    setStep('password');
                    setMfaSetupData(null);
                },
            }
        );
    };

    const handleRemoveMfa = () => {
        if (
            window.confirm(
                'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
            )
        ) {
            removeMfa.mutate();
        }
    };

    return (
        <div className={styles.container}>
            <PageHeader
                title="Security Settings"
                subtitle="Manage your account security"
            />

            <div className={styles.grid}>
                <div className={styles.mainSection}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Change Password</h2>
                        <p className={styles.cardDescription}>
                            We recommend using a strong password you don't use elsewhere
                        </p>

                        <form onSubmit={handlePasswordSubmit(onChangePasswordSubmit)} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="currentPassword">Current Password</label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    className={styles.input}
                                    {...passwordRegister('currentPassword', {
                                        required: 'Current password is required',
                                    })}
                                />
                                {passwordErrors.currentPassword && (
                                    <span className={styles.error}>{passwordErrors.currentPassword.message}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    className={styles.input}
                                    {...passwordRegister('newPassword', {
                                        required: 'New password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters',
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
                                            message:
                                                'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
                                        },
                                    })}
                                />
                                {passwordErrors.newPassword && (
                                    <span className={styles.error}>{passwordErrors.newPassword.message}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className={styles.input}
                                    {...passwordRegister('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: (value, form) =>
                                            value === form.newPassword || 'Passwords do not match',
                                    })}
                                />
                                {passwordErrors.confirmPassword && (
                                    <span className={styles.error}>{passwordErrors.confirmPassword.message}</span>
                                )}
                            </div>

                            <div className={styles.formActions}>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={changePassword.isPending}
                                    disabled={changePassword.isPending}
                                >
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </div>

                    {step === 'password' && (
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Two-Factor Authentication</h2>
                            <p className={styles.cardDescription}>
                                Add an extra layer of security to your account by requiring a verification code in addition to your password
                            </p>

                            {user?.mfaEnabled ? (
                                <div className={styles.mfaStatus}>
                                    <div className={styles.mfaStatusInfo}>
                                        <span className={styles.mfaEnabled}>Two-factor authentication is enabled</span>
                                        <p className={styles.mfaDescription}>
                                            You'll need to provide a verification code from your authenticator app when signing in
                                        </p>
                                    </div>
                                    <Button
                                        variant="danger"
                                        onClick={handleRemoveMfa}
                                        isLoading={removeMfa.isPending}
                                        disabled={removeMfa.isPending}
                                    >
                                        Disable 2FA
                                    </Button>
                                </div>
                            ) : (
                                <div className={styles.mfaSetup}>
                                    <p>
                                        Two-factor authentication is currently disabled. Enable it to make your account more secure.
                                    </p>

                                    <form onSubmit={handleMfaSubmit(onSetupMfaSubmit)} className={styles.form}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="mfaPassword">Verify your password</label>
                                            <input
                                                id="mfaPassword"
                                                type="password"
                                                className={styles.input}
                                                {...mfaRegister('password', {
                                                    required: 'Password is required to enable 2FA',
                                                })}
                                            />
                                            {mfaErrors.password && (
                                                <span className={styles.error}>{mfaErrors.password.message}</span>
                                            )}
                                        </div>

                                        <div className={styles.formActions}>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                isLoading={setupMfa.isPending}
                                                disabled={setupMfa.isPending}
                                            >
                                                Set up two-factor authentication
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'setup' && mfaSetupData && (
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Set Up Two-Factor Authentication</h2>

                            <ol className={styles.setupSteps}>
                                <li>
                                    <h3>Install an authenticator app</h3>
                                    <p>Download and install an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy</p>
                                </li>
                                <li>
                                    <h3>Scan the QR code</h3>
                                    <p>Open your authenticator app and scan this QR code to add your account</p>
                                    <div className={styles.qrCodeContainer}>
                                        <img
                                            src={mfaSetupData.qrCodeUrl}
                                            alt="QR Code for two-factor authentication"
                                            className={styles.qrCode}
                                        />
                                    </div>
                                    <p className={styles.manualCode}>
                                        <strong>Can't scan the code?</strong> Enter this key manually: <code>{mfaSetupData.secret}</code>
                                    </p>
                                </li>
                                <li>
                                    <h3>Verify setup</h3>
                                    <p>Enter the 6-digit code from your authenticator app</p>
                                    <div className={styles.verifyForm}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="verificationCode">Verification Code</label>
                                            <input
                                                id="verificationCode"
                                                type="text"
                                                className={styles.input}
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                maxLength={6}
                                                placeholder="000000"
                                            />
                                        </div>
                                        <div className={styles.formActions}>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setStep('password');
                                                    setMfaSetupData(null);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={onVerifyMfaSubmit}
                                                isLoading={verifyMfa.isPending}
                                                disabled={verificationCode.length !== 6 || verifyMfa.isPending}
                                            >
                                                Verify and activate
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    )}
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.infoCard}>
                        <h3 className={styles.infoTitle}>Security Recommendations</h3>
                        <ul className={styles.infoList}>
                            <li>Use a strong, unique password</li>
                            <li>Enable two-factor authentication</li>
                            <li>Change your password regularly</li>
                            <li>Don't share your credentials with anyone</li>
                            <li>Be alert for suspicious account activity</li>
                        </ul>
                    </div>

                    <div className={styles.infoCard}>
                        <h3 className={styles.infoTitle}>Recent Activity</h3>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 01-2-2h4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M12 15V3M8 7l4-4 4 4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.activityTitle}>Successful login</div>
                                <div className={styles.activityTime}>Today at 10:30 AM</div>
                                <div className={styles.activityDetail}>From 192.168.1.1 · Chrome on Windows</div>
                            </div>
                        </div>
                        <div className={styles.activityItem}>
                            <div className={styles.activityIcon}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <circle
                                        cx="12"
                                        cy="7"
                                        r="4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.activityTitle}>Profile updated</div>
                                <div className={styles.activityTime}>Yesterday at 4:12 PM</div>
                            </div>
                        </div>
                        <div className={styles.viewAllActivity}>
                            <Button variant="text" href="/activity">
                                View All Activity →
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};
