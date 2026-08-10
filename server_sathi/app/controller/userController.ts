
import bcrypt from "bcryptjs";
import { createUser, deleteOTP, getUserByMail, updatOTP, updatTokens } from "../model/user.js";
import { issueTokens } from "./refresherController.js";
import { clearCookieOptions, hashToken, REFRESH_COOKIE } from "../config/tokens.js";
import { findHash, listSessions, revokeAllForUser, revokeFamily } from "../model/refreshToken.js";
import { sendOTPackGmailQueue } from "../service/queue/gmailQueue.js";
import { sendOTP } from "../config/helperfunction/userHelper.js";
import { mailaccesRealTime } from "../service/googleMail.js";
import crypto from "crypto";


export const createController = async (req: any, res: any) => {
    try {
        const { userEmail, phoneNumber, organizationName, userName } = req.body;
        if (!userEmail || !phoneNumber) {
            return res.status(401).json({
                message: "Need userEmail or phonenumber",
                success: false
            })
        }

        const userData = await createUser({
            userEmail: userEmail,
            phoneNumber: phoneNumber,
            organizationName: organizationName,
            userName: userName
        })
        return res.status(200).json({
            message: "user registered success fully!",
            success: true,
            data: userData
        })

    } catch (error: any) {
        return res.status(500).json({
            message: error?.message,
            success: false
        })
    }
}

export const sendOtpTouser = async (req: any, res: any) => {
    try {
        const { identifier } = req.body;
        if (!identifier) {
            return res.status(401).json({
                success: false,
                message: "gmail or phone number required"
            })
        }

        const checkUser = await getUserByMail(identifier);
        if (!checkUser) {
            return res.status(402).json({
                message: "User does not exist!",
                success: false
            })
        }

        const otp = sendOTP()
        const encryptedOTp = await bcrypt.hashSync(otp, 10);
        const futeureMinute = 10 * 60 * 1000
        const otpExpireTimestamp = new Date(Date.now() + futeureMinute);
        await updatOTP(identifier, {
            otpCode: encryptedOTp || null,
            otpExpiresAt: otpExpireTimestamp || null
        })

        await sendOTPackGmailQueue.add("otp-sent", {
            type: "otp",
            to: checkUser?.userEmail,
            otp: otp
        }, {
            priority: 1
        })


        return res.json({
            message: "OTP has been sent to your mail",

            user: checkUser
        })


    } catch (error: any) {
        return res.status(500).json({
            message: "error in signin",
            error: error.message
        })
    }
}

export const veriFyOTP = async (req: any, res: any) => {
    try {
        const { identifier } = req.params;
        const { otp } = req.body;
        if (!identifier) {
            return res.status(400).json({
                message: "required phone or email id",
                success: false
            })
        }

        const existingUser = await getUserByMail(identifier);
        if (!existingUser) {
            return res.status(401).json({
                message: "user does not exist",
                success: false
            })
        }
        const currentTimestamp = new Date();
        const existingOTimestamp = new Date(existingUser.otpExpiresAt!)
        if (currentTimestamp > existingOTimestamp) {
            return res.status(402).json({
                message: "OTP is already Expire",
                success: false
            })
        }

        const compareOtp = await bcrypt.compare(otp, existingUser.otpCode!);
        if (!compareOtp) {
            return res.status(403).json({
                message: "wrong OTP Entred",
                success: false
            })
        }


        const accessToken = await issueTokens(res, existingUser, crypto.randomUUID(), req);
        await deleteOTP(existingUser.id);
        await mailaccesRealTime(existingUser.userEmail!)
        return res.json({
            message: "you have signIn successfully!",
            accessToken,
            user: existingUser
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "errorn in verify otp",
            success: false
        })

    }
}
export const logout = async (req: any, res: any) => {
    try {
        const raw = req.cookies?.[REFRESH_COOKIE];
        if (raw) {
            const known = await findHash(hashToken(raw));
            if (known) await revokeFamily(known.familyId, known.userId)
        }
        res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
        res.sendStatus(204)
    } catch (error: any) {
        return res.status(500).json({
            message: "error in logout",
            error: error.message
        })
    }
}

export const logoutAll = async (req: any, res: any) => {
    try {
        await revokeAllForUser(req.user.id);
        res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
        res.sendStatus(204)
    } catch (error: any) {
        return res.status(500).json({
            message: "Error in logout All",
            error: error?.message
        })
    }
}

export const sessions = async (req: any, res: any) => {
    try {
        console.log("here is session ", req.user)
        return res.json({
            sessions: await listSessions(req.user.id)
        })
    } catch (error: any) {
        return res.status(500).json({
            message: "Error in session",
            error: error.message
        })
    }
}

export const deleteSession = async (req: any, res: any) => {
    try {
   
        const owned = await listSessions(req.user.id);
        if (!owned?.some((s) => s.familyId === req.params.familyId)) {
            return res.status(404).json({
                error: "SESSION_NOT_FOUND"
            })
        }
        await revokeFamily(req.params.familyId, req.user.id);
        const raw = req.cookies?.[REFRESH_COOKIE];
        if (raw) {
            const current = await findHash(hashToken(raw));
            if (current?.familyId === req.params.familyId) {
                res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
            }
        }
        res.sendStatus(204)
    } catch (error: any) {
        return res.status(500).json({
            message: "Error in delete session",
            error: error.message
        })
    }
}