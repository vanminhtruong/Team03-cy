export function useUtils() {
    const getCookie = async (name) => {
        if (typeof window === 'undefined') {
            return null;
        }
        const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1];
        return value;
    };

    return {
        getCookie
    };
}
