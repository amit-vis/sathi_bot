import { setAccessToken, setUser } from "../auth/store";
import { axiosInstance } from "./axios"

export const adminloggedin = async (loginData: any)=>{
    const res = await axiosInstance.post("/admin/login", {
        email: loginData.email,
        password: loginData.password
    });
    setAccessToken(res.data?.accessToken);
    setUser(res.data?.user);
    return res
}