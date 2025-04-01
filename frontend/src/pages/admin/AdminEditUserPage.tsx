import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackend } from '../../context/BackendContext';
import { Button } from '../../design-system';
import { InfoCard, InfoList, PageHeader } from '../../design-system/components';
import styles from './AdminUserFormPage.module.css';

interface EditUserFormData {
    displayName: string;
    email: string;
    isActive: boolean;
}

export const AdminEditUserPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const backend = useBackend();
    const queryClient = useQueryClient();

    const [userRoles, setUserRoles] = useState<string[]>([]);

    // Form handling
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<EditUserFormData>();

    // Fetch user details
    const { data: userData, isLoading: userLoading, isError: userError } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID is required');

            const response = await backend.api.admin.users[userId].get();
            if (response.error) {
                throw new Error('Failed to fetch user details');
            }
            return response.data?.user;
        },
        enabled: !!userId
    });

    // Fetch available roles
    const { data: rolesData, isLoading: rolesLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const response = await backend.api.admin.roles.get();
            if (response.error) {
                throw new Error('Failed to fetch roles');
            }
            return response.data?.roles || [];
        }
    });

    // Set form values when user data is loaded
    useEffect(() => {
        if (userData) {
            reset({
                displayName: userData.displayName,
                email: userData.email,
                isActive: userData.isActive,
            });

            // Set user roles
            if (userData.roles) {
                setUserRoles(userData.roles.map(role => role.id));
            }
        }
    }, [userData, reset]);

    // Update user mutation
    const updateUser = useMutation({
        mutationFn: async (data: EditUserFormData) => {
            if (!userId) throw new Error('User ID is required');

            // Update user details
            const userResponse = await backend.api.admin.users[userId].put({
                displayName: data.displayName,
                isActive: data.isActive
            });

            if (userResponse.error) {
                throw new Error(userResponse.error);
            }

            return userResponse.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    // Toggle role for user mutation
    const toggleRole = useMutation({
        mutationFn: async ({ roleId, hasRole }: { roleId: string; hasRole: boolean }) => {
            if (!userId) throw new Error('User ID is required');

            if (hasRole) {
                // Remove role
                return await backend.api.admin.users[userId].roles[roleId].delete();
            } else {
                // Add role
                return await backend.api.admin.users[userId].roles.post({ roleId });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        }
    });

    // Handle status change
    const toggleStatus = useMutation({
        mutationFn: async (isActive: boolean) => {
            if (!userId) throw new Error('User ID is required');

            return await backend.api.admin.users[userId].status.put({
                isActive
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    const handleUpdateSubmit = (data: EditUserFormData) => {
        updateUser.mutate(data);
    };

    const handleRoleToggle = (roleId: string) => {
        const hasRole = userRoles.includes(roleId);

        toggleRole.mutate(
            { roleId, hasRole },
            {
                onSuccess: () => {
                    setUserRoles(prev =>
                        hasRole
                            ? prev.filter(id => id !== roleId)
                            : [...prev, roleId]
                    );
                }
            }
        );
    };

    if (userLoading) {
        return <div className={styles.loadingContainer}>Loading user details...</div>;
    }

    if (userError || !userData) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>Failed to load user details. The user may not exist.</p>
                <Button variant="primary" onClick={() => navigate('/admin/users')}>
                    Back to Users
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <PageHeader
                title="Edit User"
                subtitle={`Managing ${userData.displayName} (${userData.email})`}
                actions={
                    <Link to="/admin/users" className={styles.backButton}>
                        Back to Users
                    </Link>
                }
            />

            <div className={styles.grid}>
                <div className={styles.mainSection}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>User Details</h2>

                        <form className={styles.form} onSubmit={handleSubmit(handleUpdateSubmit)}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    className={`${styles.input} ${styles.readonlyField}`}
                                    value={userData.email}
                                    disabled
                                />
                                <p className={styles.fieldHelp}>Email addresses cannot be changed</p>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="displayName">Display Name</label>
                                <input
                                    id="displayName"
                                    type="text"
                                    className={styles.input}
                                    {...register('displayName', { required: 'Display name is required' })}
                                />
                                {errors.displayName && <span className={styles.error}>{errors.displayName.message}</span>}
                            </div>

                            <div className={styles.formActions}>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    isLoading={updateUser.isPending}
                                    disabled={updateUser.isPending}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Account Status</h2>
                        <p className={styles.cardDescription}>
                            {userData.isActive
                                ? 'This user account is currently active and can log in to the system.'
                                : 'This user account is currently inactive and cannot log in to the system.'}
                        </p>

                        <div className={styles.statusToggle}>
                            <Button
                                variant={userData.isActive ? 'danger' : 'primary'}
                                onClick={() => toggleStatus.mutate(!userData.isActive)}
                                isLoading={toggleStatus.isPending}
                                disabled={toggleStatus.isPending}
                            >
                                {userData.isActive ? 'Deactivate Account' : 'Activate Account'}
                            </Button>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>User Roles</h2>
                        <p className={styles.cardDescription}>
                            Assign or remove roles to control what this user can access
                        </p>

                        {rolesLoading ? (
                            <p>Loading roles...</p>
                        ) : (
                            <div className={styles.rolesContainer}>
                                {rolesData && rolesData.map((role) => (
                                    <div key={role.id} className={styles.roleItem}>
                                        <div className={styles.roleInfo}>
                                            <h3 className={styles.roleName}>{role.name}</h3>
                                            <p className={styles.roleDescription}>{role.description}</p>
                                        </div>

                                        <div className={styles.roleToggle}>
                                            <Button
                                                variant={userRoles.includes(role.id) ? 'secondary' : 'primary'}
                                                onClick={() => handleRoleToggle(role.id)}
                                                isLoading={toggleRole.isPending}
                                                size="small"
                                            >
                                                {userRoles.includes(role.id) ? 'Remove' : 'Assign'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {rolesData && rolesData.length === 0 && (
                                    <p className={styles.noRoles}>No roles available. Create roles first.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <aside className={styles.sidebar}>
                    <InfoCard title="User Information">
                        <div className={styles.userInfo}>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>ID:</span>
                                <span className={styles.infoValue}>{userData.id}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Email Verified:</span>
                                <span className={styles.infoValue}>
                                    {userData.isEmailVerified ? (
                                        <span className={styles.verifiedBadge}>Verified</span>
                                    ) : (
                                        <span className={styles.unverifiedBadge}>Unverified</span>
                                    )}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Created:</span>
                                <span className={styles.infoValue}>
                                    {new Date(userData.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Last Login:</span>
                                <span className={styles.infoValue}>
                                    {userData.lastLoginAt
                                        ? new Date(userData.lastLoginAt).toLocaleString()
                                        : 'Never'}
                                </span>
                            </div>
                        </div>
                    </InfoCard>

                    <InfoCard title="User Management Tips">
                        <InfoList
                            items={[
                                'Update display names to make users more identifiable',
                                'Deactivate accounts instead of deleting them to preserve data',
                                'Assign roles based on least privilege principle',
                                'Review user permissions regularly'
                            ]}
                        />
                    </InfoCard>
                </aside>
            </div>
        </div>
    );
};
