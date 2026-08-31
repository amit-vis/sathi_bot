import { prisma } from "../config/db.js"

export const createAdmin = async (userData: any)=>{
    const newAdminData = await prisma.user.create({
        data:{
            userEmail: userData?.userEmail,
            userName: userData?.userName,
            userChild:{
                create:{
                    isAdmin: true,
                    password: userData.password
                }
            }
        }
    });
    return newAdminData
}

export const updateSubscription = async (subscriptionData: any)=>{
    
}