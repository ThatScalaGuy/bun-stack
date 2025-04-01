import { Link } from 'react-router';
import { useBackend } from '../../context/BackendContext';
import styles from './AdminUserListPage.module.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InfoCard, InfoList, PageHeader } from '../../design-system/components';
import { Button } from '../../design-system';

export const AdminUserListPage = () => {
    const backend = useBackend();
    const queryClient = useQueryClient();

    // Fetch users with React Query
    const {
        data: usersData,
        isLoading: usersLoading,
        isError: usersError,
        refetch: refetchUsers
    } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await backend.api.admin.users.get();
            if (response.error) {
                throw new Error('Failed to fetch users');
            }
            return response.data.users;
        }
    });

    // Fetch roles with React Query
    const {
        data: rolesData,
    } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const response = await backend.api.roles.index.get();
            if (response.error) {
                throw new Error('Failed to fetch roles');
            }
            return response.data!.roles.map((role) => role.name);
        }
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: (userId: string) => backend.api.admin.users({ userId }).status.put({ isActive: false }),
        onSuccess: () => {
            // Invalidate and refetch the users data
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        deleteUserMutation.mutate(userId);
    };

    // Extract data from query results
    const users = usersData || [];
    const roles = rolesData || [];

    if (usersLoading && users.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading users...</p>
            </div>
        );
    }

    if (usersError && users.length === 0) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>Failed to load users. Please try again.</p>
                <button
                    className={styles.retryButton}
                    onClick={() => refetchUsers()}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <PageHeader
                title="User Management"
                subtitle="View and manage all users in the system"
                actions={
                    <Link to="/admin/users/create" className={styles.createButton}>
                        Create User
                    </Link>
                }
            />

            <div className={styles.grid}>
                <div className={styles.mainSection}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Users</h2>
                        </div>

                        <div className={styles.sectionContent}>
                            <div className={styles.tableContainer}>
                                {usersLoading && <div className={styles.tableOverlay}>Loading...</div>}
                                <table className={styles.usersTable}>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.displayName}</td>
                                                <td>{user.email}</td>

                                                <td>
                                                    {user.isEmailVerified ? (
                                                        <span className={styles.verifiedBadge}>Verified</span>
                                                    ) : (
                                                        <span className={styles.unverifiedBadge}>Unverified</span>
                                                    )}
                                                </td>

                                                <td>{user.createdAt?.toString()}</td>
                                                <td>
                                                    <div className={styles.actionButtons}>
                                                        <Link to={`/admin/users/${user.id}/edit`} className={styles.editButton}>
                                                            Edit
                                                        </Link>
                                                        <button
                                                            className={styles.deleteButton}
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            disabled={deleteUserMutation.isPending && deleteUserMutation.variables === user.id}
                                                        >
                                                            {deleteUserMutation.isPending && deleteUserMutation.variables === user.id
                                                                ? 'Deleting...'
                                                                : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {users.length === 0 && !usersLoading && (
                                <div className={styles.noResults}>
                                    <p>No users found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.sideSection}>
                    <InfoCard title="User Management Tips">
                        <InfoList
                            items={[
                                <>
                                    <strong>Create users</strong> with appropriate roles based on their responsibilities.
                                </>,
                                <>
                                    <strong>Edit users</strong> to update their information or change their permissions.
                                </>,
                                <>
                                    <strong>Deactivate accounts</strong> instead of deleting them to maintain data integrity.
                                </>
                            ]}
                        />
                    </InfoCard>

                    <InfoCard title="Security Note">
                        <p className={styles.tipsText}>
                            Remember that user management actions are logged for security purposes.
                            Only make changes when necessary and follow your organization's security policies.
                        </p>
                    </InfoCard>
                </div>
            </div>
        </div>
    );
};
