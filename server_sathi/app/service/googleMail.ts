import axios from "axios";
import { CLASSIFY_HEADERS } from "../config/helperfunction/helper.js"
import { gemailQueue } from "./queue/gmailQueueExtracter.js"
import { createUser, getUserByMail, updatewtchExpire, updatOTP, updatTokens } from "../model/user.js";
import { decryptionToken, encryptToken, sendOTP } from "../config/helperfunction/userHelper.js";
import { sendOTPackGmailQueue } from "./queue/gmailQueue.js";
import bcrypt from "bcryptjs";
import logger from "../utils/logger.js";

const BUFFER_MS = 2 * 60 * 1000;

const GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.labels",
]

export const redirecTGmail = async (req: any, res: any) => {
    try {
        const params = new URLSearchParams({
            client_id: process.env.GMAIL_CLIENT_ID!,
            redirect_uri: process.env.GMAIL_REDIRECT_URI!,
            response_type: "code",
            scope: GMAIL_SCOPES.join(" "),
            access_type: "offline",
            prompt: "consent"

        })
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
        return res.redirect(authUrl)
    } catch (error: any) {
        logger.error("Error in Gmail redirect", {
            type: "GMAIL_OAUTH",
            action: "redirecTGmail",
            error: error.message
        });
        console.error(error)
    }
}

const createLables = async (accessToken: string, userEmail: string, lableName: string) => {
    try {
        const response = await axios.post(
            `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/labels`,
            {
                "name": lableName,
                "labelListVisibility": "labelShow",
                "messageListVisibility": "show",
                "color": {
                    "textColor": "#ffffff",
                    "backgroundColor": "#000000"
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        const newLabelId = response.data.id;
        
        const newLabelName = response.data.name;

        console.log(`Label successfully created!`);
        console.log(`Label Name: ${newLabelName}`);
        console.log(`Label ID: ${newLabelId}`, response.data); // <-- Yeh rahi aapki label ki ID
        logger.info("Gmail label created successfully", {
            type: "GMAIL_LABEL",
            action: "createLables",
            email: userEmail,
            details: { labelName: lableName, labelId: newLabelId }
        });

        return newLabelId;
    } catch (error: any) {
        if (error.response && error.response.status === 409) {
            console.log(`Label "${lableName}" already exists. Fetching existing ID...`);
            const listReponse = await getLabels(accessToken);

            const existintLables = listReponse.find(
                (l: any) => l.name.toLowerCase() === lableName.toLowerCase()
            );
            if (existintLables) {
                return existintLables.id; // Purani wali ID wapas kar do
            }
        }
        logger.error(`Error creating label ${lableName}`, {
            type: "GMAIL_LABEL",
            action: "createLables",
            email: userEmail,
            error: error.message
        });
        console.error(`Error creating label ${lableName}:`, error.message);
        throw error;
    }
}

const fetchUserInfo = async (accessToken: any) => {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v2/userinfo`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        console.log("here is the userinfo", response.data)
        return response.data;
    } catch (error: any) {
        logger.error("Failed to fetch user info from Google", {
            type: "GMAIL_AUTH",
            action: "fetchUserInfo",
            error: error.message
        });
        console.error(error)
    }
}

export const callbackUrl = async (req: any, res: any) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ error: "No authorization code provided" });
        }
        const tokenresponse = await axios.post(
            `https://oauth2.googleapis.com/token`,
             new URLSearchParams({
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
        code: code as string,
        redirect_uri: process.env.GMAIL_REDIRECT_URI!,
        grant_type: 'authorization_code',
    })
        );
        const gmailToken = tokenresponse.data.access_token;
        const gmailRefreshToken = tokenresponse.data.refresh_token;
        const expiresInMs = tokenresponse.data.expires_in * 1000;
        const expiresAt = new Date(Date.now() + expiresInMs)
        let user;
        let UserInfo;
        const lablesName = ["bot_accessed", "bot_blocked"]
        let labelsId = []

        try {
            UserInfo = await fetchUserInfo(gmailToken);

            user = await getUserByMail(UserInfo?.email);
            const otp = sendOTP()
            const encryptOTP = await bcrypt.hash(otp, 10)
            const futeureMinute = 10 * 60 * 1000
            const otpExpireTimestamp = new Date(Date.now() + futeureMinute);
            const encryptedAccessToken = encryptToken(gmailToken);
            const encryptedRefrshToken = gmailRefreshToken 
    ? encryptToken(gmailRefreshToken) 
    : null;

            if (user) {
                user = await updatTokens(UserInfo?.email,
                    {
                        AccessToken: encryptedAccessToken,
                        mailRefreshToken: encryptedRefrshToken,
                        ExpiryTimestamp: expiresAt,

                    }
                )

                await updatOTP(UserInfo?.email, {
                    otpCode: encryptOTP || null,
                    otpExpiresAt: otpExpireTimestamp || null
                })
                logger.info("Existing user tokens updated", {
                    type: "USER_AUTH",
                    action: "callbackUrl",
                    email: UserInfo?.email
                });
            } else {
                for (const label of lablesName) {
                    const labelId = await createLables(gmailToken, UserInfo?.email, label);
                    labelsId.push(labelId)
                }
                user = await createUser({
                    userEmail: UserInfo?.email,
                    userName: UserInfo?.name,
                    AccessToken: encryptedAccessToken,
                    RefreshToken: encryptedRefrshToken,
                    Labels: lablesName,
                    LabelsIds: labelsId,
                    ExpiryTimestamp: expiresAt,
                    otpCode: encryptOTP || null,
                    otpExpiresAt: otpExpireTimestamp || null,
                    mailType: "gmail",
                    isEmailVerified: true
                });

                await sendOTPackGmailQueue.add("onboard-mail", {
                    type: "onboard",
                    to: UserInfo?.email,
                    userName: UserInfo?.name
                }, {
                    priority: 10
                })

                logger.info("New user onboarded successfully", {
                    type: "USER_AUTH",
                    action: "callbackUrl",
                    email: UserInfo?.email
                });

            }

            await sendOTPackGmailQueue.add("otp-sent", {
                type: "otp",
                to: UserInfo?.email,
                otp: otp
            }, {
                priority: 1
            })

        } catch (error: any) {
            logger.error("Failed to process user info in callback", {
                type: "USER_AUTH",
                action: "callbackUrl",
                error: error.message
            });
            console.error("Failed to fetch user info:", error);
            return res.status(500).json({ error: "Failed to fetch user information" });
        }
        return res.redirect(`${process.env.FRONTEND_URL}/otp?email=${encodeURIComponent(
            UserInfo?.email
        )}`)
    } catch (error: any) {
        logger.error("Gmail callback general error", {
            type: "USER_AUTH",
            action: "callbackUrl",
            error: error.message
        });
        console.error("Gmail callback error:", error);
        return res.status(500).json({ error: "Authentication failed" });
    }
}

export const generateNewAccessToken = async (userMail: string) => {
    try {
        const currentTimeStamp = Date.now() + BUFFER_MS;
        const record = await getUserByMail(userMail.trim().toLowerCase());
        console.log("lookup:", userMail, "→", record ? record.userEmail : "NOT FOUND");
        if (!record) {
            logger.warn("User not found for token generation", {
                type: "TOKEN_GENERATION",
                action: "generateNewAccessToken",
                email: userMail
            });
            return null;
        }

        // access token abhi valid hai
        if (record.AccessToken &&
            record.ExpiryTimestamp &&
            record.ExpiryTimestamp.getTime() > currentTimeStamp) {
            return decryptionToken(record.AccessToken);
        }

        // refresh chahiye — pehle guard
        if (!record.mailRefreshToken) {
            logger.error("No refresh token available, re-authorization needed", {
                type: "TOKEN_GENERATION",
                action: "generateNewAccessToken",
                email: userMail
            });
            console.error(`No refresh token for ${userMail} — re-authorize needed`);
            return null;
        }

        const refreshToken = decryptionToken(record?.mailRefreshToken);
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GMAIL_CLIENT_ID,
            client_secret: process.env.GMAIL_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            // access_type / prompt yahan bekaar hain, hata do
        });

        const newAccessToken = response.data.access_token;
        const expiresAt = new Date(Date.now() + response.data.expires_in * 1000);

        const updateData: any = {
            AccessToken: encryptToken(newAccessToken),
            ExpiryTimestamp: expiresAt,
        };
        if (response.data.refresh_token) {                       // ✅ mila tabhi
            updateData.mailRefreshToken = encryptToken(response.data.refresh_token);
        }
        await updatTokens(userMail, updateData);
        logger.info("Access token refreshed successfully", {
            type: "TOKEN_GENERATION",
            action: "generateNewAccessToken",
            email: userMail
        });

        return newAccessToken;
    } catch (error: any) {
        logger.error("Token refresh failed", {
            type: "TOKEN_GENERATION",
            action: "generateNewAccessToken",
            email: userMail,
            error: error?.response?.data || error?.message
        });
        console.error("Token refresh failed:", error?.response?.data || error?.message);
        return null;
    }
};

const getMessageId = async (accessToken: string, pageToken: string | null = null) => {
    try {
        const params: any = {
            q: "is:unread -label:bot_accessed -label:bot_blocked category:primary after:2026/07/15",
            maxResults: 100
        };

        if (pageToken) {
            params.pageToken = pageToken;
        }

        const response = await axios.get(
            `https://www.googleapis.com/gmail/v1/users/me/messages`,
            {
                params,
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return {
            messages: response.data.messages || [],
            nextPageToken: response.data.nextPageToken || null
        };
    } catch (error: any) {
        console.error('Gmail API error:', error);
        return { messages: [], nextPageToken: null };
    }
}
export const getAllUnreadMessages = async (accessToken: string) => {
    let allMessages: any[] = [];
    let pageToken: string | null = null;
    let pageCount = 0;

    do {
        const { messages, nextPageToken } = await getMessageId(accessToken, pageToken);

        if (messages && messages.length > 0) {
            allMessages = [...allMessages, ...messages];
            pageCount++;
            console.log(`📄 Page ${pageCount}: ${messages.length} messages (Total: ${allMessages.length})`, allMessages);
        } else {
            break;
        }

        pageToken = nextPageToken;
        if (pageToken) {
            await new Promise(r => setTimeout(r, 500));
        }

    } while (pageToken);

    console.log(`Total Unread: ${allMessages.length}`);
    return allMessages;
}


export const markAsProcessed = async (
    accessToken: string,
    messageIds: string[],
    userMail: string
) => {
    try {
        if (messageIds.length === 0) {
            return true;
        }

        const getUser = await getUserByMail(userMail);
        if (!getUser) {
            return false
        }
        const lableId = getUser.LabelsIds?.[0]

        console.log(`🔄 Marking ${messageIds.length} messages as read...`);

        const response = await axios.post(
            `https://www.googleapis.com/gmail/v1/users/me/messages/batchModify`,
            {
                "ids": messageIds,
                "addLabelIds": [lableId]
            },
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(`✅ Successfully marked ${messageIds.length} as read`);
        return true;

    } catch (error: any) {
        const status = error?.response?.status;
        console.error(`Error marking as read (${status}):`, error?.message);

        if (status === 403) {
            console.log(`\n  PERMISSION ERROR (403)`);
            console.log(`   This likely means missing Gmail OAuth scope`);
            console.log(`   FIX:`);
            console.log(`   1. Go to Google Cloud Console`);
            console.log(`   2. Add scope: gmail.modify`);
            console.log(`   3. Generate new refresh token`);
        }

        if (status === 400) {
            console.log(`BAD REQUEST (400)`);
            console.log(`   Message IDs format issue`);
        }

        return false;
    }
}

export const markAsbotBlocked = async (
    accessToken: string,
    messageIds: string[],
    userMail: string
) => {
    try {
        if (messageIds.length === 0) {
            return true;
        }

        const getUser = await getUserByMail(userMail);
        if (!getUser) {
            return false
        }
        const lableId = getUser.LabelsIds?.[1]

        console.log(`🔄 Marking ${messageIds.length} messages as read...`);

        const response = await axios.post(
            `https://www.googleapis.com/gmail/v1/users/me/messages/batchModify`,
            {
                "ids": messageIds,
                "addLabelIds": [lableId]
            },
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(` Successfully marked ${messageIds.length} as read`);
        return true;

    } catch (error: any) {
        const status = error?.response?.status;
        console.error(` Error marking as read (${status}):`, error?.message);

        if (status === 403) {
            console.log(`\n  PERMISSION ERROR (403)`);
            console.log(`   This likely means missing Gmail OAuth scope`);
            console.log(`   FIX:`);
            console.log(`   1. Go to Google Cloud Console`);
            console.log(`   2. Add scope: gmail.modify`);
            console.log(`   3. Generate new refresh token`);
        }

        if (status === 400) {
            console.log(`\n  BAD REQUEST (400)`);
            console.log(`   Message IDs format issue`);
        }

        return false;
    }
}

const getAttachment = async (messagesId: any, parts: any, accessToken: any) => {
    try {
        if (!parts) return [];
        const attachments = [];

        for (const part of parts) {
            if (part.filename && part.body && part.body.attachmentId) {
                const filename = part.filename;
                const attachementId = part.body.attachmentId;
                const mimeType = part.mimeType;


                try {
                    const response = await axios.get(
                        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messagesId}/attachments/${attachementId}`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    );


                    const base64 = Buffer.from(response.data.data, "base64url").toString("base64");

                    attachments.push({
                        filename,
                        mimeType,
                        data: base64,
                        size: response.data.size,
                    });
                } catch (error: any) {
                    console.error(` Error: ${filename}`);
                }
            }
        }

        return attachments;
    } catch (error) {
        console.error('Attachment error:', error);
        return [];
    }
};
const getMessageBody = (payload: any) => {
    let encodedBody = '';

    if (payload.parts && payload.parts.length > 0) {
        const part = payload.parts.find((p: any) => p.mimeType === 'text/plain');
        if (part && part.body && part.body.data) {
            encodedBody = part.body.data;
        } else if (payload.parts[0].body && payload.parts[0].body.data) {
            encodedBody = payload.parts[0].body.data;
        }
    }
    else if (payload.body && payload.body.data) {
        encodedBody = payload.body.data;
    }

    if (encodedBody) {
        return Buffer.from(encodedBody, 'base64url').toString('utf-8');
    }

    return "No text content found";
}

interface ExtractionConfig {
    includeAttachments?: boolean;
    maxFileSize?: number;
}

export const getmessages = async (
    accessToken: string,
    messageId: string,
    config?: ExtractionConfig
) => {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const payload = response.data.payload;
        const rawHeaders = payload?.headers || [];
        const labels: string[] = response.data.labelIds || [];
        const internalDate = response.data.internalDate;

        const headerMap: Record<string, string> = {};
        for (const h of rawHeaders) {
            if (h?.name) headerMap[String(h.name).toLowerCase()] = String(h.value ?? "");
        }

        const extracted: any = {
            messageId,
            threadId: response.data.threadId,
            from: headerMap["from"] || "Unknown",
            subject: headerMap["subject"] || "No Subject",
            body: getMessageBody(payload),
            date: new Date(parseInt(internalDate)).toLocaleString(),
            internalDate: Number(internalDate),

            labelIds: labels,
            headers: headerMap,

            isUnread: labels.includes("UNREAD"),
            extracted_at: new Date(),
        };

        if (config?.includeAttachments && payload?.parts) {
            extracted.attachments = await getAttachment(messageId, payload.parts, accessToken);
            extracted.attachmentCount = extracted.attachments?.length || 0;
        } else {
            extracted.attachments = [];
            extracted.attachmentCount = 0;
        }

        return extracted;
    } catch (error: any) {
        console.error(" Get message error messs:", error?.response?.data || error?.message);

        return null;
    }
};



export const notification = async (req: any, res: any) => {
    try {
        console.log(`\n Notification received at: ${new Date().toLocaleTimeString()}`);

        const encodeddata = req.body.message.data;
        const decodedString = Buffer.from(encodeddata, 'base64').toString('utf-8');
        let payload = JSON.parse(decodedString);

        const userData = await getUserByMail(payload?.emailAddress);
        payload = {...payload, userId:userData?.id!}

        await gemailQueue.add("sync", payload, {
            jobId: `${payload.emailAddress}-${payload.historyId}`
        });
        logger.info("Gmail push notification processed", {
            type: "GMAIL_WEBHOOK",
            action: "notification",
            email: payload?.emailAddress,
            historyId: payload?.historyId
        });
        return res.status(200).json({
            ok: true
        })


    } catch (error: any) {
        logger.error("Webhook notification error", {
            type: "GMAIL_WEBHOOK",
            action: "notification",
            error: error.message
        });
        console.error(" Notification error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}

export const mailaccesRealTime = async (userEmail: string) => {
    const accessToken = await generateNewAccessToken(userEmail);   // ✅ await
    if (!accessToken) {  
        logger.error("Skipping watch registration due to missing token", {
            type: "GMAIL_WATCH",
            action: "mailaccesRealTime",
            email: userEmail
        });                                          // ✅ ab yeh actual value check karega
        console.error(`No token for ${userEmail} — watch skip`);
        return null;                                              // ✅ return zaroori — aage mat badho
    }
    try {
        const resdata = await axios.post(
            `https://www.googleapis.com/gmail/v1/users/me/watch`,
            {
                labelIds: ["INBOX"],
                topicName: "projects/project-4d61adc1-429a-40ef-bfe/topics/BizNest_bot_automation"
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log(`Watch registered for ${userEmail}:`, resdata.data);
        logger.info("Watch registered successfully", {
            type: "GMAIL_WATCH",
            action: "mailaccesRealTime",
            email: userEmail
        });

        await updatewtchExpire(resdata.data.expiration, userEmail)
        return resdata.data;
    } catch (error: any) {
        logger.error("Gmail watch registration failed", {
            type: "GMAIL_WATCH",
            action: "mailaccesRealTime",
            email: userEmail,
            error: error?.response?.data || error?.message
        });
        console.error("watch failed:", error?.response?.data || error?.message);
        throw error;
    }
};

export const getLabels = async (accessToken: any) => {

    const response = await axios.get(`https://www.googleapis.com/gmail/v1/users/me/labels`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });
    console.log("Label List:", response.data.labels);
    return response.data.labels
}

export const getMessageMeta = async (accessToken: string,
    messageId: string) => {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
            {
                params: {
                    format: "metadata",
                    metadataHeaders: CLASSIFY_HEADERS
                },
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        const payload = response.data.payload;
        const rawHeaders = payload?.headers || [];
        const labels: string[] = response.data.labelIds || [];

        const headerMap: Record<string, string> = {};
        for (const h of rawHeaders) {
            if (h?.name) headerMap[String(h.name).toLowerCase()] = String(h.value ?? "");
        }
        const extracted: any = {
            messageId,
            threadId: response.data.threadId,
            from: headerMap["from"] || "Unknown",
            subject: headerMap["subject"] || "No Subject",



            labelIds: labels,
            headers: headerMap,

        }

        return extracted
    } catch (error: any) {
        console.error(" Get message error:", error?.response?.data || error?.message);
        return null;
    }
}

export const stopUserwatch = async (req: any, res: any) => {
    try {
        const { id } = req.query;
        const getUser = await getUserByMail(id);
        if (!getUser) {
            return res.status(400).json({
                message: "user does not exist",
                success: false
            })
        }
        const acctessToken = await generateNewAccessToken(getUser.userEmail!);
        if (!acctessToken) {
            return res.status(401).json({
                message: "accessToken is not exist",
                success: false
            })
        }

        const response = await axios.post(`https://gmail.googleapis.com/gmail/v1/users/me/stop`, {}, {
            headers: {
                "Authorization": `Bearer ${acctessToken}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 200 || response.status === 204) {
            logger.info("User watch stopped successfully", {
                type: "GMAIL_WATCH",
                action: "stopUserwatch",
                email: getUser.userEmail
            });
            return res.status(200).json({
                message: "User subscription stop successfully!",
                success: true
            })
        }

    } catch (error: any) {
        logger.error("Error stopping Gmail watch", {
            type: "GMAIL_WATCH",
            action: "stopUserwatch",
            error: error.message
        });
        return res.status(500).json({
            message: "error in stoppin watch",
            error: error
        })
    }
}