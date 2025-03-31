import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { ResetPasswordConfirm } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import styles from './PasswordReset.module.css';

export const PasswordResetConfirm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordConfirm & { confirmPassword: string }>({
        defaultValues: { token: token || '' }
    });
    const { confirmPasswordReset } = useAuth();
    const [resetSuccess, setResetSuccess] = useState(false);

    const password = watch('password');

    const onSubmit = async (data: ResetPasswordConfirm) => {
        try {
            await confirmPasswordReset.mutateAsync({
                token: data.token,
                password: data.password
            });
            setResetSuccess(true);
        } catch (error) {
            console.error('Password reset confirmation error:', error);
        }
    };

    if (!token) {
        return (
            <div className={styles.container}>
                <div className={styles.errorMessage}>
                    <h2>Invalid Request</h2>
                    <p>The password reset link appears to be invalid or expired.</p>
                    <Link to="/forgot-password" className={styles.linkButton}>
                        Request a new reset link
                    </Link>
                </div>
            </div>
        );
    }

    if (resetSuccess) {
        return (
            <div className={styles.container}>
                <div className={styles.successMessage}>
                    <h2>Password Reset Successful!</h2>
                    <p>Your password has been updated successfully.</p>
                    <button
                        className={styles.button}
                        onClick={() => navigate('/login')}
                    >
                        Login with New Password
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>Create New Password</h2>
            <p className={styles.description}>
                Please enter a new password for your account.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <input type="hidden" {...register('token')} />

                <div className={styles.formGroup}>
                    <label htmlFor="password">New Password</label>
                    <input
                        id="password"
                        type="password"
                        className={styles.input}
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                        {...register('password', {
                            required: 'New password is required',
                            minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters'
                            },
                            pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                            }
                        })}
                    />
                    {errors.password && <span className={styles.error}>{errors.password.message}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        className={styles.input}
                        placeholder="Confirm your new password"
                        autoComplete="new-password"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => value === password || 'Passwords do not match'
                        })}
                    />
                    {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword.message}</span>}
                </div>

                <button
                    type="submit"
                    className={styles.button}
                    disabled={confirmPasswordReset.isPending}
                >
                    {confirmPasswordReset.isPending ? 'Updating...' : 'Update Password'}
                </button>
            </form>

            {confirmPasswordReset.error && (
                <div className={styles.errorMessage}>
                    {(confirmPasswordReset.error)?.message || 'An error occurred. The token may be invalid or expired.'}
                </div>
            )}
        </div>
    );
};
