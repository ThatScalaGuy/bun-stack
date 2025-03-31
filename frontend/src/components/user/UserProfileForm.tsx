import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { UpdateProfileData } from '../../types/user';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackend } from '../../context/BackendContext';
import styles from './UserProfileForm.module.css';

export const UserProfileForm = () => {
    const { user } = useAuth();
    const backend = useBackend();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateProfileData>();

    // Set form default values when user data is available
    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
            });
        }
    }, [user, reset]);

    const updateProfile = useMutation({
        mutationFn: (data: UpdateProfileData) =>
            backend.api.users.me.put(data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        }
    });

    const onSubmit = (data: UpdateProfileData) => {
        updateProfile.mutate(data);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h2>Edit Profile</h2>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="firstName">First Name</label>
                        <input
                            id="firstName"
                            className={styles.input}
                            {...register('firstName', {
                                required: 'First name is required',
                                minLength: {
                                    value: 2,
                                    message: 'First name must be at least 2 characters'
                                }
                            })}
                        />
                        {errors.firstName && <span className={styles.error}>{errors.firstName.message}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            id="lastName"
                            className={styles.input}
                            {...register('lastName', {
                                required: 'Last name is required',
                                minLength: {
                                    value: 2,
                                    message: 'Last name must be at least 2 characters'
                                }
                            })}
                        />
                        {errors.lastName && <span className={styles.error}>{errors.lastName.message}</span>}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        className={styles.input}
                        {...register('username', {
                            required: 'Username is required',
                            minLength: {
                                value: 3,
                                message: 'Username must be at least 3 characters'
                            },
                            pattern: {
                                value: /^[a-zA-Z0-9_]+$/,
                                message: 'Username can only contain letters, numbers, and underscores'
                            }
                        })}
                    />
                    {errors.username && <span className={styles.error}>{errors.username.message}</span>}
                </div>

                <div className={styles.infoGroup}>
                    <label>Email</label>
                    <div className={styles.readonlyField}>
                        {user.email}
                        {user.isVerified ? (
                            <span className={styles.verifiedBadge}>✓ Verified</span>
                        ) : (
                            <span className={styles.unverifiedBadge}>Not Verified</span>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className={styles.button}
                    disabled={updateProfile.isPending}
                >
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </form>

            {updateProfile.isSuccess && (
                <div className={styles.successMessage}>
                    Profile updated successfully!
                </div>
            )}

            {updateProfile.error && (
                <div className={styles.errorMessage}>
                    {(updateProfile.error as any)?.message || 'An error occurred while updating your profile.'}
                </div>
            )}
        </div>
    );
};
