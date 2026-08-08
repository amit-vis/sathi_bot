import { axiosInstance } from "./axios"

export const embeddedSignup = async (data: any) =>{
    await axiosInstance.post(
        `/whatsapp/embedded-signup`,
        {code: data.code, session: data.session},
        {
            headers:{
                "Content-Type": "application/json"
            }
        }
    );
}