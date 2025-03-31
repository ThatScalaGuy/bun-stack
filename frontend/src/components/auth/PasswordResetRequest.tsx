import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { ResetPasswordRequest } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import styles from './PasswordReset.module.css';

export const PasswordResetRequest = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordRequest>();
    const { requestPasswordReset } = useAuth();
    const [requestSent, setRequestSent] = useState(false);

    const onSubmit = async (data: ResetPasswordRequest) => {
        try {
            await requestPasswordReset.mutateAsync(data);
            setRequestSent(true);
        } catch (error) {
            console.error('Password reset request error:', error);
        }
    };

    if (requestSent) {
        return (
            <div className={styles.container}>
                <div className={styles.successMessage}>
                    <h2>Password Reset Email Sent</h2>
                    <p>If an account exists with the provided email, you will receive a password reset link shortly.</p>
                    <p>Please check your inbox and follow the instructions to reset your password.</p>
                    <Link to="/login" className={styles.linkButton}>
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>Reset Your Password</h2>
            <p className={styles.description}>
                Enter the email address associated with your account, and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        className={styles.input}
                        placeholder="Enter your email"
                        autoComplete="email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        })}
                    />
                    {errors.email && <span className={styles.error}>{errors.email.message}</span>}
                </div>

                <button
                    type="submit"
                    className={styles.button}
                    disabled={requestPasswordReset.isPending}
                >
                    {requestPasswordReset.isPending ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            <div className={styles.links}>
                <Link to="/login" className={styles.link}>
                    Return to Login
                </Link>
            </div>

            {requestPasswordReset.error && (
                <div className={styles.errorMessage}>
                    An error occurred. Please try again later.
                </div>
            )}
        </div>
    );
};
