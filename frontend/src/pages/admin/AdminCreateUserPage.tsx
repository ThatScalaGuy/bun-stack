import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useBackend } from '../../context/BackendContext';
import { Button } from '../../design-system';
import { InfoCard, InfoList, PageHeader } from '../../design-system/components';
import styles from './AdminUserFormPage.module.css';

interface CreateUserFormData {
    email: string;
    displayName: string;
    password: string;
    confirmPassword: string;
    roles: string[];
}

export const AdminCreateUserPage = () => {
    const navigate = useNavigate();
    const backend = useBackend();
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    // Form handling
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        watch,
    } = useForm<CreateUserFormData>();

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

    // Create user mutation
    const createUser = useMutation({
        mutationFn: async (data: {
            email: string;
            displayName: string;
            password: string;
            roles: string[];
        }) => {
            // First create the user
            const userResponse = await backend.api.admin.users.post({
                email: data.email,
                displayName: data.displayName,
                password: data.password,
            });

            if (userResponse.error || !userResponse.data?.user?.id) {
                throw new Error(userResponse.error || 'Failed to create user');
            }

            // Then assign roles if any were selected
            const userId = userResponse.data.user.id;

            if (data.roles && data.roles.length > 0) {
                for (const roleId of data.roles) {
                    await backend.api.admin.users[userId].roles.post({
                        roleId: roleId
                    });
                }
            }

            return userResponse.data;
        },
        onSuccess: () => {
            navigate('/admin/users');
        },
        onError: (error: any) => {
            console.error('Error creating user:', error);
        },
    });

    const handleCreateSubmit = (data: CreateUserFormData) => {
        // Validate passwords match
        if (data.password !== data.confirmPassword) {
            setError('confirmPassword', {
                type: 'manual',
                message: 'Passwords do not match'
            });
            return;
        }

        // Create user
        createUser.mutate({
            email: data.email,
            displayName: data.displayName,
            password: data.password,
            roles: selectedRoles,
        });
    };

    const handleRoleToggle = (roleId: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    return (
        <div className={styles.container}>
            <PageHeader
                title="Create New User"
                subtitle="Add a new user to the system"
                actions={
                    <Link to="/admin/users" className={styles.backButton}>
                        Back to Users
                    </Link>
                }
            />

            <div className={styles.grid}>
                <div className={styles.mainSection}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>User Information</h2>
                        <form className={styles.form} onSubmit={handleSubmit(handleCreateSubmit)}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    className={styles.input}
                                    placeholder="user@example.com"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                />
                                {errors.email && <span className={styles.error}>{errors.email.message}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="displayName">Display Name</label>
                                <input
                                    id="displayName"
                                    type="text"
                                    className={styles.input}
                                    placeholder="John Doe"
                                    {...register('displayName', { required: 'Display name is required' })}
                                />
                                {errors.displayName && <span className={styles.error}>{errors.displayName.message}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    className={styles.input}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters'
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
                                            message: 'Password must include lowercase, uppercase, number, and special character'
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
                                    {...register('confirmPassword', {
                                        required: 'Please confirm password',
                                        validate: value => value === watch('password') || "Passwords do not match"
                                    })}
                                />
                                {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword.message}</span>}
                            </div>

                            <div className={styles.formActions}>
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate('/admin/users')}
                                    type="button"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    isLoading={createUser.isPending}
                                    disabled={createUser.isPending}
                                >
                                    Create User
                                </Button>
                            </div>
                        </form>
                    </div>

                    {rolesData && rolesData.length > 0 && (
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Assign Roles</h2>
                            <p className={styles.cardDescription}>
                                Select the roles this user should have
                            </p>
                            <div className={styles.rolesContainer}>
                                {rolesData.map((role) => (
                                    <div key={role.id} className={styles.roleCheckbox}>
                                        <input
                                            type="checkbox"
                                            id={`role-${role.id}`}
                                            checked={selectedRoles.includes(role.id)}
                                            onChange={() => handleRoleToggle(role.id)}
                                        />
                                        <label htmlFor={`role-${role.id}`}>
                                            <strong>{role.name}</strong> - <span className={styles.roleDescription}>{role.description}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {rolesLoading && <p>Loading roles...</p>}
                        </div>
                    )}
                </div>

                <aside className={styles.sidebar}>
                    <InfoCard title="Creating Users">
                        <InfoList
                            items={[
                                'Users will receive an email with verification instructions',
                                'Strong passwords are recommended',
                                'Assign appropriate roles based on responsibilities',
                                'Users can be edited or deactivated later if needed'
                            ]}
                        />
                    </InfoCard>

                    <InfoCard title="Password Requirements">
                        <InfoList
                            items={[
                                'At least 8 characters long',
                                'Include at least one uppercase letter',
                                'Include at least one lowercase letter',
                                'Include at least one number',
                                'Include at least one special character'
                            ]}
                        />
                    </InfoCard>
                </aside>
            </div>
        </div>
    );
};
