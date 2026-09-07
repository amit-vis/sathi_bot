import axios from "axios";
import { encryptToken, PinGenerator, sendOTP } from "../config/helperfunction/userHelper.js";
import { createUser } from "../model/user.js";
import bcrypt from "bcryptjs";
export const whatsAppcallbackUrl = async (req, res) => {
    try {
        const token = req.query['hub.verify_token'];
        const mode = req.query["hub.mode"];
        const challenge = req.query["hub.challenge"];
        console.log("here is the challange", token, process.env.WHATSAPP_VERIFY_TOKEN, mode);
        if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            console.log("here is the challange", challenge);
            return res.status(200).send(challenge);
        }
        return res.sendStatus(403);
    }
    catch (error) {
        console.error(error);
    }
};
export const whatsAppCallbackpost = async (req, res) => {
    console.log("Incoming", JSON.stringify(req.body, null, 2));
    return res.sendStatus(200);
};
export const embbededSignup = async (req, res) => {
    try {
        const { code, session } = req.body;
        const { waba_id, phone_number_id } = session;
        const V = process.env.GRAPH_VERSION;
        const tokenRes = await axios.get(`https://graph.facebook.com/${V}/oauth/access_token?` +
            new URLSearchParams({
                client_id: process.env.META_APP_ID,
                client_secret: process.env.META_APP_SECRET,
                code: code,
            }));
        const { access_token } = tokenRes.data;
        await axios.post(`https://graph.facebook.com/${V}/${waba_id}/subscribed_apps`, {}, {
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            }
        });
        const pinCode = PinGenerator();
        await axios.post(`https://graph.facebook.com/${V}/${phone_number_id}/register`, {
            messaging_product: "whatsapp",
            code: pinCode
        }, {
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            }
        });
        const getUserDetails = await axios.get(`https://graph.facebook.com/${V}/${phone_number_id}`, {
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("getUserDetails", getUserDetails.data);
        const { verified_name, display_phone_number } = getUserDetails.data;
        const otp = sendOTP();
        const encryptedOTp = await bcrypt.hashSync(otp, 10);
        const futeureMinute = 10 * 60 * 1000;
        const otpExpireTimestamp = new Date(Date.now() + futeureMinute);
        const encryptedPinCode = await bcrypt.hashSync(pinCode, 10);
        await createUser({
            userMobileNumber: display_phone_number,
            wabaId: waba_id,
            phoneNumberId: phone_number_id,
            whatsappPin: encryptedPinCode,
            whatsappaccessToken: encryptToken(access_token),
            otpCode: encryptedOTp || null,
            otpExpiresAt: otpExpireTimestamp || null,
            organizationName: verified_name,
            userName: verified_name
        });
        res.redirect(`${process.env.FRONTEND_URL}/otp?phoneNumber=${display_phone_number}`);
    }
    catch (error) {
        console.error(error);
    }
};
//# sourceMappingURL=whatsappweb.js.map