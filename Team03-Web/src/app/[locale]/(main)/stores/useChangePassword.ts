import { create } from 'zustand';

interface PasswordState {
    showOldPassword: boolean;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
    message: string;
    loading: boolean;
    failedAttempts: number;
    lockTime: number | null;
    remainingTime: number;
    toggleShowOldPassword: () => void;
    toggleShowNewPassword: () => void;
    toggleShowConfirmPassword: () => void;
    setOldPassword: (value: string) => void;
    setNewPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    setMessage: (value: string) => void;
    setLoading: (value: boolean) => void;
    setFailedAttempts: (value: number | ((prev: number) => number)) => void;
    setLockTime: (value: number | null) => void;
    setRemainingTime: (value: number) => void;
}

const usePasswordStore = create<PasswordState>((set) => ({
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    message: '',
    loading: false,
    failedAttempts: 0,
    lockTime: null,
    remainingTime: 0,

    toggleShowOldPassword: () => set((state) => ({ showOldPassword: !state.showOldPassword })),
    toggleShowNewPassword: () => set((state) => ({ showNewPassword: !state.showNewPassword })),
    toggleShowConfirmPassword: () => set((state) => ({ showConfirmPassword: !state.showConfirmPassword })),
    setOldPassword: (value) => set({ oldPassword: value }),
    setNewPassword: (value) => set({ newPassword: value }),
    setConfirmPassword: (value) => set({ confirmPassword: value }),
    setMessage: (value) => set({ message: value }),
    setLoading: (value) => set({ loading: value }),
    setFailedAttempts: (value) => set((state) => ({
        failedAttempts: typeof value === 'function' ? value(state.failedAttempts) : value
    })),
    setLockTime: (value) => set({ lockTime: value }),
    setRemainingTime: (value) => set({ remainingTime: value })
}));

export default usePasswordStore;
