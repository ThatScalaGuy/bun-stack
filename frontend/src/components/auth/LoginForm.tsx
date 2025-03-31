import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { LoginCredentials } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import styles from './LoginForm.module.css';

export const LoginForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [requiresMfa, setRequiresMfa] = useState(false);
    const [mfaToken, setMfaToken] = useState('');
    const [userId, setUserId] = useState<string | null>(null);

    const onSubmit = async (data: LoginCredentials) => {
        try {
            const response = await login.mutateAsync(data);
            if (!response) {
                throw new Error('Login failed');

            }
            if (response.requireMfa) {
                setRequiresMfa(true);
                // @ts-expect-error Ich bin doof
                setUserId(response.user?.id || null);
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleMfaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        try {
            await login.mutateAsync({
                mfaToken,
                userId
            } as unknown as LoginCredentials);
            navigate('/dashboard');
        } catch (error) {
            console.error('MFA verification error:', error);
        }
    };

    if (requiresMfa) {
        return (
            <div className={styles.container}>
                <h2>Two-Factor Authentication</h2>
                <p>Please enter the verification code from your authenticator app.</p>

                <form onSubmit={handleMfaSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="mfaToken">Verification Code</label>
                        <input
                            id="mfaToken"
                            type="text"
                            value={mfaToken}
                            onChange={(e) => setMfaToken(e.target.value)}
                            className={styles.input}
                            placeholder="Enter 6-digit code"
                            autoComplete="off"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={login.isPending}
                    >
                        {login.isPending ? 'Verifying...' : 'Verify'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>Login</h2>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        className={styles.input}
                        placeholder="Email address"
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

                <div className={styles.formGroup}>
                    <div className={styles.labelRow}>
                        <label htmlFor="password">Password</label>
                        <Link to="/forgot-password" className={styles.forgotPassword}>
                            Forgot Password?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        className={styles.input}
                        placeholder="Password"
                        autoComplete="current-password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters'
                            }
                        })}
                    />
                    {errors.password && <span className={styles.error}>{errors.password.message}</span>}
                </div>

                <button
                    type="submit"
                    className={styles.button}
                    disabled={login.isPending}
                >
                    {login.isPending ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className={styles.registerLink}>
                Don't have an account? <Link to="/register">Register</Link>
            </div>

            {login.error && (
                <div className={styles.errorMessage}>
                    {(login.error)?.message || 'An error occurred during login'}
                </div>
            )}
        </div>
    );
};
