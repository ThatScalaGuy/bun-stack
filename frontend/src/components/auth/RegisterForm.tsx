import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { RegistrationData } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import styles from './RegisterForm.module.css';

export const RegisterForm = () => {
    const { register: registerField, handleSubmit, formState: { errors }, watch } = useForm<RegistrationData & { confirmPassword: string }>();
    const { register } = useAuth();
    const navigate = useNavigate();
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const password = watch('password');

    const onSubmit = async (data: RegistrationData) => {
        try {
            await register.mutateAsync(data);
            setRegistrationSuccess(true);
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    if (registrationSuccess) {
        return (
            <div className={styles.container}>
                <div className={styles.successMessage}>
                    <h2>Registration Successful!</h2>
                    <p>A verification email has been sent to your email address.</p>
                    <p>Please check your inbox and follow the instructions to verify your account.</p>
                    <button
                        className={styles.button}
                        onClick={() => navigate('/login')}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>Create Your Account</h2>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="displayName">Display Name</label>
                    <input
                        id="displayName"
                        className={styles.input}
                        placeholder="Enter your display name"
                        autoComplete="name"
                        {...registerField('displayName', {
                            required: 'Display name is required',
                            minLength: {
                                value: 2,
                                message: 'Display name must be at least 2 characters'
                            }
                        })}
                    />
                    {errors.displayName && <span className={styles.error}>{errors.displayName.message}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        className={styles.input}
                        placeholder="Email address"
                        autoComplete="email"
                        {...registerField('email', {
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
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        className={styles.input}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        {...registerField('password', {
                            required: 'Password is required',
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
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        className={styles.input}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        {...registerField('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => value === password || 'Passwords do not match'
                        })}
                    />
                    {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword.message}</span>}
                </div>

                <button
                    type="submit"
                    className={styles.button}
                    disabled={register.isPending}
                >
                    {register.isPending ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <div className={styles.loginLink}>
                Already have an account? <Link to="/login">Log in</Link>
            </div>

            {register.error && (
                <div className={styles.errorMessage}>
                    {(register.error)?.message || 'An error occurred during registration'}
                </div>
            )}
        </div>
    );
};
