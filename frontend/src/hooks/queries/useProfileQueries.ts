import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackend } from '../../context/BackendContext';
import { UpdateProfileData } from '../../types/user';

export function useProfileQueries() {
    const backend = useBackend();
    const queryClient = useQueryClient();

    // Update profile
    const updateProfile = useMutation({
        mutationFn: (data: UpdateProfileData) =>
            backend.api.users.me.put(data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        }
    });

    // Change password
    const changePassword = useMutation({
        mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
            const result = await backend.api.users['change-password'].post(data)
            if (result.status === 422) {
                throw new Error('Invalid password');
            }
            if (result.status !== 200) {
                throw new Error(result.error?.value.message || 'Failed to change password');
            }
            return result.data!;
        },
    });

    return {
        updateProfile,
        changePassword,
    };
}
