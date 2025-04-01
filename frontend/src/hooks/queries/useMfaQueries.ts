import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackend } from '../../context/BackendContext';
import { MfaVerifyRequest } from '../../types/user';

export function useMfaQueries() {
    const backend = useBackend();
    const queryClient = useQueryClient();

    // MFA Setup
    const setupMfa = useMutation({
        mutationFn: (data: { password?: string, type?: string } = { type: 'totp' }) =>
            backend.api.users.me.mfa.setup.post(data).then(res => res.data),
    });

    // MFA Verify
    const verifyMfa = useMutation({
        mutationFn: (data: MfaVerifyRequest) =>
            backend.api.auth.mfa.verify.post(data).then(res => res.data),
    });

    // MFA Disable
    const disableMfa = useMutation({
        mutationFn: () =>
            backend.api.users.me.mfa.delete().then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        }
    });

    return {
        setupMfa,
        verifyMfa,
        disableMfa,
    };
}
