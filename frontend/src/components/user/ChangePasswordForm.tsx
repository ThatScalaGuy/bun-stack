import { useForm } from 'react-hook-form';
import { useBackend } from '../../context/BackendContext';
import { ChangePasswordData } from '../../types/user';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import styles from './ChangePasswordForm.module.css';

export const ChangePasswordForm = () => {
    const backend = useBackend();
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ChangePasswordData & { confirmNewPassword: string }>();
    const [changeSuccess, setChangeSuccess] = useState(false);

    const newPassword = watch('newPassword');

    const changePassword = useMutation({
        mutationFn: (data: ChangePasswordData) =>
            backend.api.users.me.password.put(data).then(res => res.data),
        onSuccess: () => {
            setChangeSuccess(true);
            reset();

            // Clear success message after 3 seconds
            setTimeout(() => {
                setChangeSuccess(false);
            }, 3000);
        }
    });

    const onSubmit = (data: ChangePasswordData & { confirmNewPassword: string }) => {
        const { confirmNewPassword, ...passwordData } = data;
        changePassword.mutate(passwordData);
    };

    return (
        <div className={styles.container}>
            <h2>Change Password</h2>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                        id="currentPassword"
                        type="password"
                        className={styles.input}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                        {...register('currentPassword', {
                            required: 'Current password is required'
                        })}
                    />
                    {errors.currentPassword && <span className={styles.error}>{errors.currentPassword.message}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        id="newPassword"
                        type="password"
                        className={styles.input}
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                        {...register('newPassword', {
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
                    {errors.newPassword && <span className={styles.error}>{errors.newPassword.message}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <input
                        id="confirmNewPassword"
                        type="password"
                        className={styles.input}
                        placeholder="Confirm your new password"
                        autoComplete="new-password"
                        {...register('confirmNewPassword', {
                            required: 'Please confirm your new password',
                            validate: (value) => value === newPassword || 'Passwords do not match'
                        })}
                    />
                    {errors.confirmNewPassword && <span className={styles.error}>{errors.confirmNewPassword.message}</span>}
                </div>

                <button
                    type="submit"
                    className={styles.button}
                    disabled={changePassword.isPending}
                >
                    {changePassword.isPending ? 'Updating...' : 'Change Password'}
                </button>
            </form>

            {changeSuccess && (
                <div className={styles.successMessage}>
                    Password changed successfully!
                </div>
            )}

            {changePassword.error && (
                <div className={styles.errorMessage}>
                    {(changePassword.error as any)?.message || 'An error occurred. Please check your current password and try again.'}
                </div>
            )}
        </div>
    );
};
