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
                isEmailVerified: userData?.isEmailVerified || null,
                userChild:{
                    create:{

                    }
                }
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
            { 
                where,
                include:{
                    subscriptions: true,
                    userChild: true
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
    const expiryDate = new Date(Number(timestamp));
    const updateUserChild = await prisma.user.update({
        where: {
            userEmail: userEmail
        },
        data: {
            msSubscriptionId: msSubscriptionId || null,
            userChild: {
                upsert: {
                    create: {
                        watchExpiresAt: expiryDate,
                        isAdmin: false // Prisma ko create karte time required fields chahiye hoti hain
                    },
                    update: {
                        watchExpiresAt: expiryDate
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

export const deactivateUser = async (userId: string, reason: string) => {
  try {
    // 1. User ko block karo (existing fields use karo)
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        blockTimestamp: new Date(),
      },
    });
 
    // 2. UserChild mein reason store karo
    await prisma.userChild.update({
      where: { userId },
      data: {
        deactivationReason: reason,
      },
    });
 
    // 3. Saare sessions delete karo (force logout)
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
 
    return { success: true, message: "Account deactivated successfully" };
  } catch (error) {
    console.error("Error deactivating user:", error);
    return { success: false, message: "Failed to deactivate account" };
  }
};
 
// ─────────────────────────────────────────────
// Delete Account (Soft Delete — 15 days window)
// ─────────────────────────────────────────────
// User DELETE type karke confirm karta hai
// 15 days ka recovery window milta hai
// Uske baad cron job permanently delete karega
 
export const deleteUser = async (userId: string, deleteInputText: string) => {
  try {
    // Validate ki user ne sahi text likha
    if (deleteInputText !== "DELETE") {
      return { success: false, message: "Invalid confirmation text" };
    }
 
    // 1. User fetch karo email bhejne ke liye
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userEmail: true, userName: true },
    });
 
    if (!user) {
      return { success: false, message: "User not found" };
    }
 
    // 2. User table mein soft delete flag set karo
    await prisma.user.update({
      where: { id: userId },
      data: {
        isDelete: true,
        deleteTimeStamp: new Date(),
        isBlocked: true,
        blockTimestamp: new Date(),
      },
    });
 
    // 3. UserChild mein DELETE input text store karo
    await prisma.userChild.update({
      where: { userId },
      data: {
        deleteInputText: deleteInputText,
      },
    });
 
    // 4. Saare sessions delete karo (force logout)
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
 
    return { success: true, message: "Account scheduled for deletion. You have 15 days to recover." };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Failed to delete account" };
  }
};
 
// ─────────────────────────────────────────────
// Reactivate Account (Support/Admin action)
// ─────────────────────────────────────────────
// Jab deactivated user contact kare support ko
 
export const reactivateUser = async (userId: string) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: false,
        blockTimestamp: null,
      },
    });
 
    await prisma.userChild.update({
      where: { userId },
      data: {
        deactivationReason: null,
      },
    });
 
    return { success: true, message: "Account reactivated successfully" };
  } catch (error) {
    console.error("Error reactivating user:", error);
    return { success: false, message: "Failed to reactivate account" };
  }
};
 
// ─────────────────────────────────────────────
// Recover Deleted Account (15 days ke andar)
// ─────────────────────────────────────────────
// Jab deleted user 15 din ke andar contact kare
 
export const recoverUser = async (userId: string) => {
  try {
    // Check karo 15 days cross to nahi ho gaye
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deleteTimeStamp: true, isDelete: true },
    });
 
    if (!user || !user.isDelete || !user.deleteTimeStamp) {
      return { success: false, message: "No deletion request found for this account" };
    }
 
    const daysSinceDeletion = Math.floor(
      (Date.now() - new Date(user.deleteTimeStamp).getTime()) / (1000 * 60 * 60 * 24)
    );
 
    if (daysSinceDeletion > 15) {
      return { success: false, message: "Recovery window expired. Account cannot be restored." };
    }
 
    // Recover karo
    await prisma.user.update({
      where: { id: userId },
      data: {
        isDelete: false,
        deleteTimeStamp: null,
        isBlocked: false,
        blockTimestamp: null,
      },
    });
 
    await prisma.userChild.update({
      where: { userId },
      data: {
        deleteInputText: null,
      },
    });
 
    return { success: true, message: "Account recovered successfully" };
  } catch (error) {
    console.error("Error recovering user:", error);
    return { success: false, message: "Failed to recover account" };
  }
};
 
// ─────────────────────────────────────────────
// Permanent Purge (Cron Job — daily run karo)
// ─────────────────────────────────────────────
// 15 days purane deleted accounts ko permanently hata do
 
export const purgeDeletedUsers = async () => {
  try {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
 
    // Find all users jinka deleteTimeStamp 15 days se purana hai
    const expiredUsers = await prisma.user.findMany({
      where: {
        isDelete: true,
        deleteTimeStamp: { lte: fifteenDaysAgo },
      },
      select: { id: true, userEmail: true },
    });
 
    if (expiredUsers.length === 0) {
      console.log("No expired accounts to purge.");
      return { success: true, purged: 0 };
    }
 
    // Cascade delete — User delete hoga to UserChild, Documents,
    // RefreshTokens, Subscription sab automatically delete ho jayenge
    for (const user of expiredUsers) {
      await prisma.user.delete({
        where: { id: user.id },
      });
      console.log(`Purged account: ${user.userEmail}`);
    }
 
    console.log(`Total purged: ${expiredUsers.length} accounts`);
    return { success: true, purged: expiredUsers.length };
  } catch (error) {
    console.error("Error purging deleted users:", error);
    return { success: false, purged: 0 };
  }
};
 
cron.schedule("0 2 * * *", async ()=>{
  await purgeDeletedUsers()
})