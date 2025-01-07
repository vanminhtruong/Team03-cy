import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
    persist(
        (set) => ({
            id: '',
            name: '',
            userName: '',
            email: '',
            roleName: '',
            setUserStore: (id: number, name: string, userName: string, email: string, roleName: any) =>
                set(() => ({
                    id,
                    name,
                    userName,
                    email,
                    roleName
                }))
        }),
        {
            name: 'user',
            partialize: (state: any) => ({
                id: state.id,
                name: state.name,
                userName: state.userName,
                email: state.email,
                roleName: state.roleName
            })
        }
    )
);

export default useUserStore;
