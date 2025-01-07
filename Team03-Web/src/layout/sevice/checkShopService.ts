import {GET} from "@/src/config/ApiService";

export const checkShopService = async (useId:any) => {
    return await GET(`/v1/api/user/${useId}`)
}
