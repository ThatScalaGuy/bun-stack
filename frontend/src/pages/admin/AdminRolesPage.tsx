import { useState, useEffect } from 'react';
import { useBackend } from '../../context/BackendContext';
import { Role } from '../../types/user';
import styles from './AdminRolesPage.module.css';

export const AdminRolesPage = () => {
    const backend = useBackend();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState<{ name: string; description: string }>({
        name: '',
        description: ''
    });

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await backend.api.admin.roles.get();
            setRoles(response.data.roles);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
            setError('Failed to load roles. Please try again.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await backend.api.admin.roles.post(formData);
            setFormData({ name: '', description: '' });
            setIsCreating(false);
            fetchRoles();
        } catch (err) {
            console.error('Failed to create role:', err);
            alert('Failed to create role. Please try again.');
        }
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditing) return;

        try {
            await backend.api.admin.roles[isEditing].put(formData);
            setFormData({ name: '', description: '' });
            setIsEditing(null);
            fetchRoles();
        } catch (err) {
            console.error('Failed to update role:', err);
            alert('Failed to update role. Please try again.');
        }
    };

    const handleEditRole = (role: Role) => {
        setIsEditing(role.id);
        setFormData({
            name: role.name,
            description: role.description
        });
    };

    const handleDeleteRole = async (roleId: string) => {
        if (!confirm('Are you sure you want to delete this role? This may affect users who have this role assigned.')) {
            return;
        }

        try {
            await backend.api.admin.roles[roleId].delete();
            fetchRoles();
        } catch (err) {
            console.error('Failed to delete role:', err);
            alert('Failed to delete role. Please try again.');
        }
    };

    if (loading && roles.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading roles...</p>
            </div>
        );
    }

    if (error && roles.length === 0) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button
                    className={styles.retryButton}
                    onClick={fetchRoles}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Role Management</h1>
                {!isCreating && !isEditing && (
                    <button
                        className={styles.createButton}
                        onClick={() => setIsCreating(true)}
                    >
                        Create Role
                    </button>
                )}
            </header>

            {isCreating && (
                <div className={styles.formContainer}>
                    <h2>Create New Role</h2>
                    <form onSubmit={handleCreateRole} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Role Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="e.g. editor, moderator"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={styles.textarea}
                                placeholder="Describe the role's permissions and responsibilities"
                                required
                            />
                        </div>

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => {
                                    setIsCreating(false);
                                    setFormData({ name: '', description: '' });
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                            >
                                Create Role
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isEditing && (
                <div className={styles.formContainer}>
                    <h2>Edit Role</h2>
                    <form onSubmit={handleUpdateRole} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Role Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="e.g. editor, moderator"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={styles.textarea}
                                placeholder="Describe the role's permissions and responsibilities"
                                required
                            />
                        </div>

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => {
                                    setIsEditing(null);
                                    setFormData({ name: '', description: '' });
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                            >
                                Update Role
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.rolesContainer}>
                {!isCreating && !isEditing && (
                    <>
                        <h2>Available Roles</h2>

                        <div className={styles.rolesList}>
                            {roles.map(role => (
                                <div key={role.id} className={styles.roleCard}>
                                    <div className={styles.roleInfo}>
                                        <h3 className={styles.roleName}>{role.name}</h3>
                                        <p className={styles.roleDescription}>{role.description}</p>
                                    </div>

                                    <div className={styles.roleActions}>
                                        <button
                                            className={styles.editButton}
                                            onClick={() => handleEditRole(role)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteRole(role.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {roles.length === 0 && (
                            <div className={styles.noRoles}>
                                <p>No roles have been created yet.</p>
                                <button
                                    className={styles.createFirstButton}
                                    onClick={() => setIsCreating(true)}
                                >
                                    Create First Role
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
