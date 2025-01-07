import {GET,POST} from "@/src/config/ApiService";

export const login = async (email:string, password:string) => {
    return await POST('/v1/api/authentication/sign-in', {
        email,
        password,
    })
}

export const signup = async (name:string, password:string,email:string) => {
    return await POST('/v1/api/authentication/sign-up', {
        name,
        password,
        email,
    })
}

export const verifyEmail = async (otp:string,email:string) => {
    return await GET('/v1/api/authentication/verify', {
        otp,
        email
    })
}
export const forgotPassword = async (email:string) => {
    return await POST('/v1/api/authentication/forgot-password', {
        email
    })
}
export const newOtp = async (email:string) => {
    return await POST('/v1/api/authentication/resend-otp', {
        email
    })
}
export const resetPassword = async (newPassword:string, token:string) => {
    return await POST(`/v1/api/authentication/reset-password?token=${encodeURIComponent(token)}`, { newPassword });
};

