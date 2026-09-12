import axios from "axios";
import { setAccessToken, setUser } from "../auth/store";
import { axiosInstance } from "./axios";

export const verifyOTP = async (otp: string, userEmail: string) => {
   const res = await axios.post(`/api/auth`, { otp, userEmail });
  setAccessToken(res.data?.accessToken);
  setUser(res.data?.user);
  return res;
};

export const signin = async (mailId: string)=>{
    const res = await axiosInstance.post(`/user/sendOtp`, {
        identifier: mailId
    });

    return res
}

export const LogoutUser = async () => {
  // pehle Next.js API route se cookie clear karo
  await fetch("/api/logout", { method: "POST" });

  // phir in-memory state bhi clear karo
  setAccessToken(null);
  setUser(null);

  window.location.href = "/signin";
};

export const getAllSession = async ()=>{
  const res = await axiosInstance.get(`/user/sessions`);
  
  return res.data
}

export const deleteSession = async (familyId: string)=>{
  const res = await axiosInstance.delete(`/user/sessions/${familyId}`);
  return res.data
}

export const updateUserPersonalDetails = async (userDetails: any)=>{
  const res = await axiosInstance.patch(`/user/userDetailsUpdateController`, userDetails);
  return res.data
}

export const deleteUser = async (deleteInput: string)=>{
  const res = await axiosInstance.post(`/user/deleteUserController`,{deleteInputText: deleteInput});
  return res
}

export const deactivateUser = async (reason: string)=>{
  const res = await axiosInstance.post(`/user/deactivateUserController`,{reason: reason});
  return res
}