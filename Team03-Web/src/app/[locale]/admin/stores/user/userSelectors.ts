import useUserStore from '@/src/app/[locale]/(auth)/stores/useStore';

export const useUserSelectors = () => {
    return useUserStore(
        (state: any) => ({
            id: state.id,
            name: state.name,
            email: state.email
        })
    );
};
