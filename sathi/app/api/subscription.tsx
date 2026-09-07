import { axiosInstance } from "./axios"

export const userSubscriptiondetails = async (paymentPage:number, creditPage: number, limit: number)=>{
    const userSubsRes = await axiosInstance.get(`/subscription/userWiseCreditController`,{
        params:{
            paymentPage: paymentPage,
            creditPage: creditPage,
            limit: limit
        }
    });
    return userSubsRes
}

export const stopSubscriptionMail = async (userId: string)=>{
    const res = await axiosInstance.get(`/gmail/stopUserwatch`,{
        params:{
            userId
        }
    });
    return res;
}

export const stopSubscriptionOutMail = async (userId: any)=>{
    const res = await axiosInstance.get("/hotmail/stopUserWatch", {
        params:{
            userId
        }
    });
    return res;
}