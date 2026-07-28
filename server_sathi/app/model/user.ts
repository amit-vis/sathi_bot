import prisma from "../config/db.js";
import { buildWhere } from "../config/userHelper.js";

export const createUser = async (userData: any)=>{
    try {
        const user = await prisma.user.create({
            data:{
                userEmail: userData?.userEmail || null,
                userMobileNumber: userData?.phoneNumber || null,
                organizationName: userData?.organizationName || null,
                userName: userData?.userName,
                gmailAccessToken: userData?.gmailAccessToken || null,
                gmailRefreshToken: userData?.gmailRefreshToken || null,
                hotmailAccessToken: userData?.hotmailAccessToken || null,
                hotmailRefreshToken: userData?.hotmailRefreshToken || null,
                gmailLabels: userData.gmailLabels || null,
                gmailLabelsIds: userData.gmailLabelsIds || null,
                gmailExpiryTimestamp: userData.gmailExpiryTimestamp || null,
                hotExpiryTimestamp: userData.hotExpiryTimestamp || null,
                otpCode: userData.otpCode || null,
                otpExpiresAt: userData?.otpExpiresAt || null,

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

    const userData = await prisma.user.findFirst({ where });
    return userData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updatTokens = async (userEmail: string, tokens: any) => {
    try {
        const updateData: any = {
            gmailAccessToken: tokens?.gmailAccessToken,
            gmailExpiryTimestamp: tokens?.gmailExpiryTimestamp,
        };

        // Sirf tabhi object mein add karo jab refresh token actual mein aaya ho
        if (tokens?.gmailRefreshToken) {
            updateData.gmailRefreshToken = tokens.gmailRefreshToken;
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
             otpCode: dataOtp.otpCode ,
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

export const deleteOTP = async (userId: string)=>{
    const data = await prisma.user.update({
        where:{
            id: userId
        },
        data:{
            otpCode: null,
            otpExpiresAt: null
        }
    });
    return data
}



