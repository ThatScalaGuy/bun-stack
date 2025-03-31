import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useBackend } from '../../context/BackendContext';
import { UserWithRoles } from '../../types/user';
import styles from './AdminUserListPage.module.css';

interface UserFilters {
    search: string;
    role: string;
    status: 'all' | 'verified' | 'unverified';
    mfa: 'all' | 'enabled' | 'disabled';
}

export const AdminUserListPage = () => {
    const backend = useBackend();
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [filters, setFilters] = useState<UserFilters>({
        search: '',
        role: '',
        status: 'all',
        mfa: 'all',
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());

            if (filters.search) queryParams.append('search', filters.search);
            if (filters.role) queryParams.append('role', filters.role);
            if (filters.status !== 'all') queryParams.append('verified', filters.status === 'verified' ? 'true' : 'false');
            if (filters.mfa !== 'all') queryParams.append('mfaEnabled', filters.mfa === 'enabled' ? 'true' : 'false');

            const response = await backend.api.admin.users.get({ params: queryParams });
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users. Please try again.');
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await backend.api.admin.roles.get();
            const roleNames = response.data.roles.map((role: any) => role.name);
            setRoles(roleNames);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFilterChange = (key: keyof UserFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPage(1); // Reset to first page on filter change
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await backend.api.admin.users[userId].delete();
            fetchUsers(); // Refresh the list after deletion
        } catch (err) {
            console.error('Failed to delete user:', err);
            alert('Failed to delete user. Please try again.');
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading users...</p>
            </div>
        );
    }

    if (error && users.length === 0) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button
                    className={styles.retryButton}
                    onClick={fetchUsers}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>User Management</h1>
                <Link to="/admin/users/create" className={styles.createButton}>
                    Create User
                </Link>
            </header>

            <div className={styles.filtersContainer}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Search by name, email or username"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        Search
                    </button>
                </form>

                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="roleFilter">Role:</label>
                        <select
                            id="roleFilter"
                            value={filters.role}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="statusFilter">Status:</label>
                        <select
                            id="statusFilter"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value as any)}
                            className={styles.filterSelect}
                        >
                            <option value="all">All</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="mfaFilter">MFA:</label>
                        <select
                            id="mfaFilter"
                            value={filters.mfa}
                            onChange={(e) => handleFilterChange('mfa', e.target.value as any)}
                            className={styles.filterSelect}
                        >
                            <option value="all">All</option>
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                        </select>
                    </div>

                    <button
                        className={styles.filterButton}
                        onClick={fetchUsers}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.usersTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Roles</th>
                            <th>Status</th>
                            <th>MFA</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{`${user.firstName} ${user.lastName}`}</td>
                                <td>{user.email}</td>
                                <td>{user.username}</td>
                                <td>
                                    <div className={styles.rolesList}>
                                        {user.roles.map(role => (
                                            <span key={role.id} className={styles.roleBadge}>
                                                {role.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    {user.isVerified ? (
                                        <span className={styles.verifiedBadge}>Verified</span>
                                    ) : (
                                        <span className={styles.unverifiedBadge}>Unverified</span>
                                    )}
                                </td>
                                <td>
                                    {user.mfaEnabled ? (
                                        <span className={styles.mfaEnabledBadge}>Enabled</span>
                                    ) : (
                                        <span className={styles.mfaDisabledBadge}>Disabled</span>
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <Link to={`/admin/users/${user.id}/edit`} className={styles.editButton}>
                                            Edit
                                        </Link>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && !loading && (
                <div className={styles.noResults}>
                    <p>No users found matching your criteria.</p>
                </div>
            )}

            <div className={styles.pagination}>
                <button
                    className={styles.paginationButton}
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                >
                    Previous
                </button>

                <span className={styles.pageInfo}>
                    Page {page} of {totalPages}
                </span>

                <button
                    className={styles.paginationButton}
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                >
                    Next
                </button>
            </div>
        </div>
    );
};
