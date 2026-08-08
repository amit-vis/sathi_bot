import {prisma} from "../config/db.js";
import { buildWhere } from "../config/helperfunction/userHelper.js";

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
                msSubscriptionId: userData?.msSubscriptionId || null
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



