import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import styles from './MultiFactorAuth.module.css';

interface MfaVerificationFormData {
    token: string;
}

export const MultiFactorAuth = () => {
    const { user, setupMfa, verifyMfa, disableMfa } = useAuth();
    const [setupState, setSetupState] = useState<'idle' | 'setup' | 'verify' | 'success'>('idle');
    const [qrCode, setQrCode] = useState<string>('');
    const [secret, setSecret] = useState<string>('');

    const { register, handleSubmit, formState: { errors }, reset } = useForm<MfaVerificationFormData>({
        defaultValues: { token: '' }
    });

    const handleSetup = async () => {
        try {
            const response = await setupMfa.mutateAsync();
            setQrCode(response.qrCode);
            setSecret(response.secret);
            setSetupState('setup');
        } catch (error) {
            console.error('MFA setup error:', error);
        }
    };

    const handleVerify = async (data: MfaVerificationFormData) => {
        try {
            await verifyMfa.mutateAsync(data);
            setSetupState('success');
            reset();
        } catch (error) {
            console.error('MFA verification error:', error);
        }
    };

    const handleDisable = async () => {
        try {
            await disableMfa.mutateAsync();
            setSetupState('idle');
        } catch (error) {
            console.error('MFA disable error:', error);
        }
    };

    if (user?.mfaEnabled) {
        return (
            <div className={styles.container}>
                <h2>Two-Factor Authentication</h2>
                <div className={styles.statusSection}>
                    <div className={styles.statusBadge}>
                        <span className={styles.enabledIcon}>✓</span> Enabled
                    </div>
                    <p>Two-factor authentication is currently enabled for your account.</p>
                </div>

                <div className={styles.actionSection}>
                    <h3>Disable Two-Factor Authentication</h3>
                    <p>
                        Warning: Disabling two-factor authentication will make your account less secure.
                    </p>
                    <button
                        className={styles.dangerButton}
                        onClick={handleDisable}
                        disabled={disableMfa.isPending}
                    >
                        {disableMfa.isPending ? 'Disabling...' : 'Disable Two-Factor Authentication'}
                    </button>
                </div>

                {disableMfa.error && (
                    <div className={styles.errorMessage}>
                        {(disableMfa.error as any)?.message || 'An error occurred while disabling two-factor authentication.'}
                    </div>
                )}
            </div>
        );
    }

    if (setupState === 'setup') {
        return (
            <div className={styles.container}>
                <h2>Set Up Two-Factor Authentication</h2>

                <div className={styles.setupInstructions}>
                    <h3>Step 1: Scan the QR Code</h3>
                    <p>Scan this QR code with your authenticator app (like Google Authenticator, Authy, or 1Password).</p>

                    <div className={styles.qrCodeContainer}>
                        <img src={qrCode} alt="QR Code for MFA setup" className={styles.qrCode} />
                    </div>

                    <div className={styles.secretKeyContainer}>
                        <h3>Can't scan the code?</h3>
                        <p>Enter this secret key manually in your authenticator app:</p>
                        <code className={styles.secretKey}>{secret}</code>
                    </div>

                    <h3>Step 2: Enter Verification Code</h3>
                    <p>Enter the 6-digit verification code from your authenticator app.</p>

                    <form onSubmit={handleSubmit(handleVerify)} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="token">Verification Code</label>
                            <input
                                id="token"
                                className={styles.input}
                                placeholder="Enter 6-digit code"
                                autoComplete="off"
                                {...register('token', {
                                    required: 'Verification code is required',
                                    pattern: {
                                        value: /^[0-9]{6}$/,
                                        message: 'Must be a 6-digit number'
                                    }
                                })}
                            />
                            {errors.token && <span className={styles.error}>{errors.token.message}</span>}
                        </div>

                        <div className={styles.buttonGroup}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => setSetupState('idle')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={styles.button}
                                disabled={verifyMfa.isPending}
                            >
                                {verifyMfa.isPending ? 'Verifying...' : 'Verify & Enable'}
                            </button>
                        </div>
                    </form>

                    {verifyMfa.error && (
                        <div className={styles.errorMessage}>
                            {(verifyMfa.error as any)?.message || 'Invalid verification code. Please try again.'}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (setupState === 'success') {
        return (
            <div className={styles.container}>
                <div className={styles.successMessage}>
                    <h2>Two-Factor Authentication Enabled!</h2>
                    <p>Your account is now more secure with two-factor authentication.</p>
                    <p>
                        <strong>Important:</strong> Save these recovery codes in a safe place. If you lose access to your
                        authenticator app, you'll need these codes to recover your account.
                    </p>

                    <div className={styles.recoveryCodes}>
                        <code>ABCD-EFGH-IJKL</code>
                        <code>MNOP-QRST-UVWX</code>
                        <code>YZ12-3456-7890</code>
                    </div>

                    <button
                        className={styles.button}
                        onClick={() => setSetupState('idle')}
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>Two-Factor Authentication</h2>
            <div className={styles.statusSection}>
                <div className={styles.statusBadge}>
                    <span className={styles.disabledIcon}>✗</span> Disabled
                </div>
                <p>Two-factor authentication is currently disabled for your account.</p>
            </div>

            <div className={styles.infoSection}>
                <h3>Why enable two-factor authentication?</h3>
                <p>
                    Two-factor authentication adds an extra layer of security to your account. In addition to your password,
                    you'll need to provide a code from your authenticator app when logging in.
                </p>
                <ul className={styles.benefitsList}>
                    <li>Protect your account even if your password is compromised</li>
                    <li>Prevent unauthorized access from unknown devices</li>
                    <li>Receive alerts when someone attempts to access your account</li>
                </ul>
            </div>

            <button
                className={styles.button}
                onClick={handleSetup}
                disabled={setupMfa.isPending}
            >
                {setupMfa.isPending ? 'Setting Up...' : 'Set Up Two-Factor Authentication'}
            </button>

            {setupMfa.error && (
                <div className={styles.errorMessage}>
                    {(setupMfa.error as any)?.message || 'An error occurred during setup. Please try again.'}
                </div>
            )}
        </div>
    );
};
