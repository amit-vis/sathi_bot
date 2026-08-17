import { setAccessToken, setUser } from "../auth/store";
import { axiosInstance } from "./axios";

export const verifyOTP = async (otp: string, userEmail: string) => {
  const res = await axiosInstance.post(`/user/verifyOtp/${userEmail}`, { otp });
  setAccessToken(res.data?.accessToken);
  setUser(res.data?.user);
  return res.data;
};

export const signin = async (mailId: string)=>{
    const res = await axiosInstance.post(`/user/sendOtp`, {
        identifier: mailId
    });

    return res.data
}

export const LogoutUser = async ()=>{
  const res = await axiosInstance.post(`/user/logout`);
  return res.data
}

export const getAllSession = async ()=>{
  const res = await axiosInstance.get(`/user/sessions`);
  return res.data
}