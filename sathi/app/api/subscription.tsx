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