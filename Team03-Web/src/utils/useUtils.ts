
export function useUtils() {
    function getCookieOnClient(name:any) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);

        if (parts.length === 2) {
            const cookieValue = parts.pop();
            if (cookieValue !== undefined) {
                return cookieValue.split(';').shift();
            }
        }

        return null;
    }

    async function getCookieOnServer(name:any) {
        const cookies = require("next/headers").cookies;
        const cookieStore = await cookies();
        return cookieStore.get(name).value;
    }

    async function getCookie(name:any) {
        if (typeof window === 'undefined') {
            return await getCookieOnServer(name)
        }
        return getCookieOnClient(name);
    }

    return {
        getCookie
    }
}
