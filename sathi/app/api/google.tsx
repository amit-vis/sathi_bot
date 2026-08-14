import { axiosInstance } from "./axios"

export const redirectRoute = async ()=>{
    const rdirectRes = await axiosInstance.get(`/gmail/redirecTGmail`);

    return rdirectRes
}