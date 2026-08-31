import {prisma} from "../config/db.js";
import { buildWhere } from "../config/helperfunction/userHelper.js";
import { mailaccesRealTime } from "../service/googleMail.js";
import { mailAccessRealTimeOutlook } from "../service/hotMail.js";
import cron from "node-cron"

export const createUser = async (userData: any) => {
    console.log("here is the userData", userData)
    try {
        const user = await prisma.user.create({
            data: {
                userEmail: userData?.userEmail || null,
                userMobileNumber: userData?.phoneNumber || null,
                organizationName: userData?.organizationName || null,
                userName: userData?.userName,
                AccessToken: userData?.AccessToken || null,
                mailRefreshToken: userData?.mailRefreshToken || null,
                Labels: userData.Labels || null,
                LabelsIds: userData.LabelsIds || null,
                ExpiryTimestamp: userData.ExpiryTimestamp || null,
                otpCode: userData.otpCode || null,
                otpExpiresAt: userData?.otpExpiresAt || null,
                msSubscriptionId: userData?.msSubscriptionId || null,
                mailType: userData.mailType || null,
                isEmailVerified: userData?.isEmailVerified || null
            }
        })
        return user
    } catch (error) {
        console.error(error)
    }
}

export const getUserByMail = async (identifier: string) => {
    try {
        const where = buildWhere(identifier);

        const userData = await prisma.user.findFirst(
            { where,
                include:{
                    subscriptions: true
                }
             }
            
        );
        return userData;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updatTokens = async (userEmail: string, tokens: any) => {
    try {
        const updateData: any = {
            AccessToken: tokens?.AccessToken,
            ExpiryTimestamp: tokens?.ExpiryTimestamp,
        };

        // Sirf tabhi object mein add karo jab refresh token actual mein aaya ho
        if (tokens?.mailRefreshToken) {
            updateData.mailRefreshToken = tokens.mailRefreshToken;
        }

        const userData = await prisma.user.update({
            where: {
                userEmail: userEmail
            },
            data: updateData
        });
        return userData;
    } catch (error) {
        console.error(error);
    }
}

export const updatOTP = async (identifier: string, dataOtp: any) => {
    try {
        const where = buildWhere(identifier);
        const updateData: any = {
            otpCode: dataOtp.otpCode,
            otpExpiresAt: dataOtp?.otpExpiresAt,
        };
        const userData = await prisma.user.update({
            where: where,
            data: updateData
        });
        return userData;
    } catch (error) {
        console.error(error);
    }
}

export const updatewtchExpire = async (timestamp: any, userEmail: string, msSubscriptionId?: string) => {
    const updateUserChild = await prisma.user.update({
        where: {
            userEmail: userEmail
        },
        data: {
            msSubscriptionId: msSubscriptionId || null,
            userChild: {
                upsert: {
                    create: {
                        watchExpiresAt: timestamp,
                        isAdmin: false // Prisma ko create karte time required fields chahiye hoti hain
                    },
                    update: {
                        watchExpiresAt: timestamp
                    }
                }
            }
        }
    });
  
    return updateUserChild;
}

export const deleteOTP = async (userId: string) => {
    const data = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            otpCode: null,
            otpExpiresAt: null,
            lastLoginAt: new Date()
        }
    });
    return data
}

export const getUserDatasubscription = async (subscriptionId: string)=>{
    const data = await prisma.user.findFirst({
        where:{
            msSubscriptionId: subscriptionId
        }
    });

    return data
}

export const updatePersonalDetails = async (udateData:any, userId: string)=>{
    console.log("here is the userData", udateData)
    const dataUpdateUser = await prisma.user.update({
        where:{
            id: userId
        },
        data:{
            userName: udateData.userName || null,
            userMobileNumber: udateData.userMobileNumber || null,
            organizationName: udateData.organizationName || null
        }
    });
    return dataUpdateUser
}

// 1. Is function ka naam change karke getExpiringUsers kar diya gaya hai
export const getExpiringUsers = async () => {
    const thresholdDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const expiringUsers = await prisma.user.findMany({
        where: {
            isBlocked: false,
            isDelete: false,
            subscriptions: {
                endDate: { gt: new Date() },
                isSubscriptionStatus: true
            },
            userChild: {
                watchExpiresAt: { lte: thresholdDate } 
            }
        },
        select: { 
            id: true, 
            userEmail: true, 
            mailType: true, 
            msSubscriptionId: true
        }
    });

    return expiringUsers;
};

// 2. Main execution function ka naam renewAllWatches rakha gaya hai
const renewAllWatches = async () => {
    // Yahan updated naam call karein
    const allUsers = await getExpiringUsers(); 
    
    // Agar array khali hai toh loop nahi chalega
    if (!allUsers || allUsers.length === 0) return; 

    for(let user of allUsers) {
        if(user.mailType === "gmail") {
            await mailaccesRealTime(user.userEmail!);
        } else if(user.mailType === "outlook") {
            await mailAccessRealTimeOutlook(user.userEmail!);
        }
    }
}

// 3. Cron job apne time par execute hogi
cron.schedule("0 0 * * *", async () => {
    console.log("Running daily watch renewal at 12:00 AM IST");
    await renewAllWatches();
}, {
    timezone: "Asia/Kolkata" 
});