import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { UpdateProfileData } from '../../types/user';
import { useProfileQueries } from '../../hooks/queries';
import { FormGroup } from '../../design-system/components/FormGroup';
import styles from './UserProfileForm.module.css';
import { Alert } from '../../design-system';

export const UserProfileForm = () => {
    const { user } = useAuth();
    const { updateProfile } = useProfileQueries();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateProfileData>();

    // Set form default values when user data is available
    useEffect(() => {
        if (user) {
            reset({
                displayName: user.displayName || '',
                bio: user.bio || '',
            });
        }
    }, [user, reset]);

    const onSubmit = (data: UpdateProfileData) => {
        updateProfile.mutate(data);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Personal Information</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                {updateProfile.isSuccess && (
                    <Alert variant='success'>Profile updated successfully!</Alert>
                )}

                {updateProfile.error && (
                    <Alert variant='danger'>
                        {(updateProfile.error)?.message || 'An error occurred while updating your profile.'}
                    </Alert>
                )}
                <FormGroup
                    label="Display Name"
                    error={errors.displayName?.message}
                    required
                >
                    <input
                        className={styles.input}
                        {...register('displayName', {
                            required: 'Display name is required',
                            minLength: {
                                value: 2,
                                message: 'Display name must be at least 2 characters'
                            }
                        })}
                    />
                </FormGroup>

                <FormGroup
                    label="Bio"
                    error={errors.bio?.message}
                    helperText="Tell us a bit about yourself (optional)"
                >
                    <textarea
                        className={`${styles.input} ${styles.textarea}`}
                        rows={4}
                        {...register('bio', {
                            maxLength: {
                                value: 500,
                                message: 'Bio cannot exceed 500 characters'
                            }
                        })}
                    />
                </FormGroup>

                <FormGroup
                    label="Email"
                >
                    <div className={styles.readonlyField}>
                        {user.email}
                        {(user.isEmailVerified || user.isVerified) ? (
                            <span className={styles.verifiedBadge}>✓ Verified</span>
                        ) : (
                            <span className={styles.unverifiedBadge}>Not Verified</span>
                        )}
                    </div>
                </FormGroup>

                <div className={styles.formActions}>
                    <button
                        type="submit"
                        className={styles.button}
                        disabled={updateProfile.isPending}
                    >
                        {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>


        </div>
    );
}
