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
        mutationFn: (data: { currentPassword: string; newPassword: string }) =>
            backend.api.users.me.password.put(data).then(res => res.data),
    });

    return {
        updateProfile,
        changePassword,
    };
}
