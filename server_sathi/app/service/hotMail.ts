import axios from "axios";
import { createUser, getUserByMail, updatOTP, updatTokens } from "../model/user.js";
import { decryptionToken, encryptToken, sendOTP } from "../config/helperfunction/userHelper.js";
import bcrypt from "bcryptjs";
import { sendOTPackGmailQueue } from "./queue/gmailQueue.js";

const MICROSOFT_SCOPES = ["offline_access", "User.Read", "Mail.Read", "Mail.ReadWrite"];

export const redirectMicrosoft = async (req: any, res: any) => {
    try {
        const params = new URLSearchParams({
            client_id: process.env.MICROSOFT_CLIENT_ID!,
            redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
            response_type: "code",
            scope: MICROSOFT_SCOPES.join(" "),
            prompt: "select_account"
        });
        const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
        return res.redirect(authUrl)
    } catch (error) {
        console.error(error)
    }
}

export const createFolder = async (accessToken: string, folderName: string) => {
    try {
        const response = await axios.post(
            `https://graph.microsoft.com/v1.0/me/mailFolders`, {
            displayName: folderName
        },
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );
        const newFolderId = response.data.id;
        console.log(`Folder successfully created! Name: ${folderName}`);
        return newFolderId;
    } catch (error: any) {
        const isConflict = error.response?.status === 409 || error.response?.data?.error?.code === "ErrorFolderExists";
        if (isConflict) {
            console.log(`Folder "${folderName}" already exists. Fetching existing ID...`);
            const listResponse = await axios.get(`https://graph.microsoft.com/v1.0/me/mailFolders`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const existingFolder = listResponse.data.value.find(
                (f: any) => f.displayName.toLowerCase() === folderName.toLowerCase()
            );
            if (existingFolder) {
                return existingFolder.id;
            }
        }
        console.error(`Error creating folder ${folderName}:`, error.response?.data || error.message);
        throw error;
    }
}

export const fetchUserInfoMicrosoft = async (accessToken: string) => {
    try {
        const response = await axios.get(
            `https://graph.microsoft.com/v1.0/me`,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );

        console.log("here is the Microsoft userinfo", response.data);
        // Microsoft Graph returns 'userPrincipalName' (or 'mail') and 'displayName'
        return {
            email: response.data.userPrincipalName || response.data.mail,
            name: response.data.displayName
        };
    } catch (error) {
        console.error(error);
    }
}
const newExpiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

export const Subscription = async (accessToken: string) => {
    const resData = await axios.post(`https://graph.microsoft.com/v1.0/subscriptions`, {
        changeType: "created,updated",
        notificationUrl: "https://annmarie-nonextractable-mathematically.ngrok-free.dev/app/hotmail/notification",
        resource: "me/mailFolders('Inbox')/messages",
        expirationDateTime: newExpiration.toISOString(),
        clientState: "sathi_bot_secret",
    }, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    return resData.data.id
}

export const callbackUrlMicrosoft = async (req: any, res: any) => {
    try {

        console.log("=== CALLBACK HIT ===", req.query);
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ error: "No authorization code provided" });
        }

        const tokenParams = new URLSearchParams({
            client_id: process.env.MICROSOFT_CLIENT_ID!,
            client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
            code: code,
            redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
            grant_type: 'authorization_code'
        });

        const tokenResponse = await axios.post(
            `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
            tokenParams.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
        console.log("here is the complete response", tokenResponse.data)
        const msAccessToken = tokenResponse.data.access_token;
        const msRefreshToken = tokenResponse.data.refresh_token;
        const expiresInMs = tokenResponse.data.expires_in * 1000;
        const expiresAt = new Date(Date.now() + expiresInMs);
        let user;
        let UserInfo;
        const folderNames = ["bot_accessed", "bot_blocked"];
        let folderId = [];
        try {
            UserInfo = await fetchUserInfoMicrosoft(msAccessToken)
            user = await getUserByMail(UserInfo?.email);
            const otp = sendOTP()
            const encryptOTP = await bcrypt.hashSync(otp, 10)
            const futeureMinute = 10 * 60 * 1000
            const otpExpireTimestamp = new Date(Date.now() + futeureMinute);
            const encryptedAccessToken = encryptToken(msAccessToken);
            const encryptedRefrshToken = encryptToken(msRefreshToken);
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
            } else {
                const subscriptionId = await Subscription(msAccessToken)
                for (const label of folderNames) {
                    const labelId = await createFolder(msAccessToken, label);
                    folderId.push(labelId)
                }
                user = await createUser({
                    userEmail: UserInfo?.email,
                    userName: UserInfo?.name,
                    AccessToken: encryptedAccessToken,
                    mailRefreshToken: encryptedRefrshToken,
                    Labels: folderNames,
                    LabelsIds: folderId,
                    ExpiryTimestamp: expiresAt,
                    otpCode: encryptOTP || null,
                    otpExpiresAt: otpExpireTimestamp || null,
                    msSubscriptionId: subscriptionId
                });

                await sendOTPackGmailQueue.add("onboard-mail", {
                    type: "onboard",
                    to: UserInfo?.email
                }, {
                    priority: 10
                })
            }
            await sendOTPackGmailQueue.add("otp-sent", {
                type: "otp",
                to: UserInfo?.email,
                otp: otp
            }, {
                priority: 1
            })
        } catch (error) {
            console.error("Microsoft callback error:", error);
            return res.status(500).json({ error: "Authentication failed" });
        }

        return res.redirect(`/dashboard`)
    } catch (error: any) {
        console.error("OUTER CATCH ERROR:", error?.response?.data || error.message);
        return res.status(500).json({ error: "Authentication failed" });
    }
}

const BUFFER_MS = 2 * 60 * 1000;

export const generateNewAccessTokenOutlook = async (userMail: string) => {
    try {
        const currentTimeStamp = Date.now() + BUFFER_MS;
        const record = await getUserByMail(userMail.trim().toLowerCase());
        console.log("lookup:", userMail, "→", record ? record.userEmail : "NOT FOUND");
        if (!record) return null;

        // access token abhi valid hai
        if (record.AccessToken &&
            record.ExpiryTimestamp &&
            record.ExpiryTimestamp.getTime() > currentTimeStamp) {
            return decryptionToken(record.AccessToken);
        }

        // refresh chahiye — pehle guard
        if (!record.mailRefreshToken) {
            console.error(`No refresh token for ${userMail} — re-authorize needed`);
            return null;
        }

        const refreshToken = decryptionToken(record.mailRefreshToken);

        // Microsoft token endpoint — "common" supports personal + work accounts
        const response = await axios.post(
            'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            new URLSearchParams({                          // ⚠️ Microsoft ko x-www-form-urlencoded chahiye
                client_id: process.env.OUTLOOK_CLIENT_ID!,
                client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
                scope: 'https://graph.microsoft.com/.default offline_access',
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const newAccessToken = response.data.access_token;
        const expiresAt = new Date(Date.now() + response.data.expires_in * 1000);

        const updateData: any = {
            AccessToken: encryptToken(newAccessToken),
            ExpiryTimestamp: expiresAt,
        };
        // Microsoft har refresh pe naya refresh token de sakta hai
        if (response.data.refresh_token) {
            updateData.mailRefreshToken = encryptToken(response.data.refresh_token);
        }
        await updatTokens(userMail, updateData);

        return newAccessToken;
    } catch (error: any) {
        console.error("Outlook token refresh failed:", error?.response?.data || error?.message);
        return null;
    }
};

// ─── Unread Messages ───

const getMessageId = async (accessToken: string, skipToken: string | null = null) => {
    try {
        // Microsoft Graph: unread, not tagged by bot, from Focused inbox
        let url = `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages`;
        const params: any = {
            $filter: "isRead eq false and receivedDateTime ge 2026-07-15T00:00:00Z",
            $select: "id",
            $top: 100,
            $orderby: "receivedDateTime desc",
        };

        if (skipToken) {
            // Graph API pagination uses full URL in @odata.nextLink,
            // but if you're passing just the skipToken:
            params.$skiptoken = skipToken;
        }

        const response = await axios.get(url, {
            params,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const messages = (response.data.value || []).map((m: any) => ({ id: m.id }));

        // nextLink se skipToken nikalo
        let nextSkipToken: string | null = null;
        const nextLink: string | undefined = response.data["@odata.nextLink"];
        if (nextLink) {
            const parsed = new URL(nextLink);
            nextSkipToken = parsed.searchParams.get("$skiptoken") || nextLink; // fallback: full URL
        }

        return { messages, nextPageToken: nextSkipToken };
    } catch (error: any) {
        console.error("Outlook API error:", error?.response?.data || error?.message);
        return { messages: [], nextPageToken: null };
    }
};

export const getAllUnreadMessages = async (accessToken: string) => {
    let allMessages: any[] = [];
    let pageToken: string | null = null;
    let pageCount = 0;

    do {
        const { messages, nextPageToken } = await getMessageId(accessToken, pageToken);

        if (messages && messages.length > 0) {
            allMessages = [...allMessages, ...messages];
            pageCount++;
            console.log(`📄 Page ${pageCount}: ${messages.length} messages (Total: ${allMessages.length})`);
        } else {
            break;
        }

        pageToken = nextPageToken;
        if (pageToken) {
            await new Promise((r) => setTimeout(r, 500));
        }
    } while (pageToken);

    console.log(`Total Unread: ${allMessages.length}`);
    return allMessages;
};

// ─── Mark as Processed (category/flag lagao) ───
// Outlook mein Gmail jaise custom labels nahi hain.
// Options: move to folder, add category, or set flag.
// Yahan categories use kar rahe hain — "bot_accessed" / "bot_blocked"

export const markAsProcessed = async (
    accessToken: string,
    messageIds: string[],
    _userMail: string
) => {
    try {
        if (messageIds.length === 0) return true;

        console.log(`🔄 Marking ${messageIds.length} messages as processed...`);

        // Graph mein batch modify nahi hai — $batch endpoint use karo
        const batchRequests = messageIds.map((id, idx) => ({
            id: String(idx + 1),
            method: "PATCH",
            url: `/me/messages/${id}`,
            headers: { "Content-Type": "application/json" },
            body: {
                categories: ["bot_accessed"],   // custom category
                // isRead: true,                // agar read bhi mark karna ho
            },
        }));

        // Graph $batch max 20 requests per call
        for (let i = 0; i < batchRequests.length; i += 20) {
            const chunk = batchRequests.slice(i, i + 20);
            await axios.post(
                "https://graph.microsoft.com/v1.0/$batch",
                { requests: chunk },
                { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
            );
        }

        console.log(`✅ Successfully marked ${messageIds.length} as processed`);
        return true;
    } catch (error: any) {
        const status = error?.response?.status;
        console.error(`Error marking as processed (${status}):`, error?.message);

        if (status === 403) {
            console.log(`  PERMISSION ERROR — add Mail.ReadWrite scope in Azure Portal`);
        }
        return false;
    }
};

export const markAsBotBlocked = async (
    accessToken: string,
    messageIds: string[],
    _userMail: string
) => {
    try {
        if (messageIds.length === 0) return true;

        console.log(`🔄 Marking ${messageIds.length} messages as bot_blocked...`);

        const batchRequests = messageIds.map((id, idx) => ({
            id: String(idx + 1),
            method: "PATCH",
            url: `/me/messages/${id}`,
            headers: { "Content-Type": "application/json" },
            body: {
                categories: ["bot_blocked"],
            },
        }));

        for (let i = 0; i < batchRequests.length; i += 20) {
            const chunk = batchRequests.slice(i, i + 20);
            await axios.post(
                "https://graph.microsoft.com/v1.0/$batch",
                { requests: chunk },
                { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
            );
        }

        console.log(`✅ Successfully marked ${messageIds.length} as bot_blocked`);
        return true;
    } catch (error: any) {
        const status = error?.response?.status;
        console.error(`Error marking as bot_blocked (${status}):`, error?.message);
        if (status === 403) {
            console.log(`  PERMISSION ERROR — add Mail.ReadWrite scope in Azure Portal`);
        }
        return false;
    }
};

// ─── Attachments ───

const getAttachment = async (messageId: string, accessToken: string) => {
    try {
        const response = await axios.get(
            `https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const attachments = [];
        for (const att of response.data.value || []) {
            // sirf file attachments, inline images skip
            if (att["@odata.type"] === "#microsoft.graph.fileAttachment") {
                attachments.push({
                    filename: att.name,
                    mimeType: att.contentType,
                    data: att.contentBytes,          
                    size: att.size,
                });
            }
        }
        return attachments;
    } catch (error: any) {
        console.error("Attachment error:", error?.response?.data || error?.message);
        return [];
    }
};

// ─── Message Body ───

const getMessageBody = (message: any): string => {
    // Graph API body already decoded deta hai
    if (message.body?.content) {
        if (message.body.contentType === "text") {
            return message.body.content;
        }
        // HTML hai — strip tags for plain text fallback
        return message.body.content.replace(/<[^>]*>/g, "").trim();
    }
    return "No text content found";
};

// ─── Get Single Message ───

interface ExtractionConfig {
    includeAttachments?: boolean;
    maxFileSize?: number;
}

export const getMessages = async (
    accessToken: string,
    messageId: string,
    config?: ExtractionConfig
) => {
    try {
        const response = await axios.get(
            `https://graph.microsoft.com/v1.0/me/messages/${messageId}`,
            {
                params: {
                    $select: "id,conversationId,from,subject,body,receivedDateTime,isRead,categories,internetMessageHeaders",
                },
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        const msg = response.data;

        // headers ko map banao (Gmail jaisa format)
        const headerMap: Record<string, string> = {};
        for (const h of msg.internetMessageHeaders || []) {
            if (h?.name) headerMap[h.name.toLowerCase()] = h.value ?? "";
        }

        const extracted: any = {
            messageId,
            threadId: msg.conversationId,                       // Gmail threadId ≈ Graph conversationId
            from: msg.from?.emailAddress
                ? `${msg.from.emailAddress.name} <${msg.from.emailAddress.address}>`
                : "Unknown",
            subject: msg.subject || "No Subject",
            body: getMessageBody(msg),
            date: new Date(msg.receivedDateTime).toLocaleString(),
            internalDate: new Date(msg.receivedDateTime).getTime(),

            categories: msg.categories || [],
            headers: headerMap,

            isUnread: !msg.isRead,
            extracted_at: new Date(),
        };

        if (config?.includeAttachments && msg.hasAttachments) {
            extracted.attachments = await getAttachment(messageId, accessToken);
            extracted.attachmentCount = extracted.attachments.length;
        } else {
            extracted.attachments = [];
            extracted.attachmentCount = 0;
        }

        return extracted;
    } catch (error: any) {
        console.error("Get message error:", error?.response?.data || error?.message);
        return null;
    }
};

// ─── Real-time Push Notifications (Gmail Watch → Graph Subscription) ───

export const mailAccessRealTime = async (userEmail: string) => {
    const accessToken = await generateNewAccessTokenOutlook(userEmail);
    if (!accessToken) {
        console.error(`No token for ${userEmail} — subscription skip`);
        return null;
    }
    try {
        // Graph subscription max 3 days (4230 minutes) for mail
        const expiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

        const resdata = await axios.post(
            "https://graph.microsoft.com/v1.0/subscriptions",
            {
                changeType: "created,updated",
                notificationUrl: process.env.OUTLOOK_WEBHOOK_URL!,   // tumhara public endpoint
                resource: "me/mailFolders('Inbox')/messages",
                expirationDateTime: expiration.toISOString(),
                clientState: "sathi_bot_secret",                     // webhook verify karne ke liye
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log(`Subscription registered for ${userEmail}:`, resdata.data);
        return resdata.data;

        // ⚠️ IMPORTANT: resdata.data.id save karo DB mein —
        // renew/delete ke liye subscription ID chahiye
    } catch (error: any) {
        console.error("Subscription failed:", error?.response?.data || error?.message);
        throw error;
    }
};

// ─── Renew Subscription (Graph subscriptions expire, Gmail watch bhi but simpler) ───
// Har 3 din mein renew karna padega — cron job lagao

export const renewSubscription = async (subscriptionId: string, userEmail: string) => {
    const accessToken = await generateNewAccessTokenOutlook(userEmail);
    if (!accessToken) return null;

    try {
        const newExpiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

        const response = await axios.patch(
            `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`,
            { expirationDateTime: newExpiration.toISOString() },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log(`Subscription renewed for ${userEmail}`);
        return response.data;
    } catch (error: any) {
        console.error("Renew failed:", error?.response?.data || error?.message);
        return null;
    }
};

// ─── Get Message Metadata ───

const CLASSIFY_HEADERS_OUTLOOK = "id,conversationId,from,subject,receivedDateTime,categories,internetMessageHeaders";

export const getMessageMeta = async (accessToken: string, messageId: string) => {
    try {
        const response = await axios.get(
            `https://graph.microsoft.com/v1.0/me/messages/${messageId}`,
            {
                params: {
                    $select: CLASSIFY_HEADERS_OUTLOOK,
                },
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        const msg = response.data;

        const headerMap: Record<string, string> = {};
        for (const h of msg.internetMessageHeaders || []) {
            if (h?.name) headerMap[h.name.toLowerCase()] = h.value ?? "";
        }

        const extracted: any = {
            messageId,
            threadId: msg.conversationId,
            from: msg.from?.emailAddress
                ? `${msg.from.emailAddress.name} <${msg.from.emailAddress.address}>`
                : "Unknown",
            subject: msg.subject || "No Subject",
            categories: msg.categories || [],
            headers: headerMap,
        };

        return extracted;
    } catch (error: any) {
        console.error("Get message meta error:", error?.response?.data || error?.message);
        return null;
    }
};

// ─── Stop Subscription ───

export const stopUserWatch = async (req: any, res: any) => {
    try {
        const { id } = req.query;
        const getUser = await getUserByMail(id);
        if (!getUser) {
            return res.status(400).json({
                message: "user does not exist",
                success: false,
            });
        }

        const accessToken = await generateNewAccessTokenOutlook(getUser.userEmail!);
        if (!accessToken) {
            return res.status(401).json({
                message: "accessToken does not exist",
                success: false,
            });
        }

        // ⚠️ DB mein subscription ID save hona chahiye
        const subscriptionId = getUser?.msSubscriptionId;
        if (!subscriptionId) {
            return res.status(400).json({
                message: "No active subscription found",
                success: false,
            });
        }

        await axios.delete(
            `https://graph.microsoft.com/v1.0/subscriptions/${subscriptionId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        // DB se bhi remove karo
        // await updateUser(getUser.userEmail, { outlookSubscriptionId: null });

        return res.status(200).json({
            message: "User subscription stopped successfully!",
            success: true,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error stopping subscription",
            error: error?.response?.data || error?.message,
        });
    }
};

// // ─── Webhook Endpoint (notifications receive karne ke liye) ───
// // Gmail mein Pub/Sub topic pe message aata hai,
// // Outlook mein tumhare notificationUrl pe POST aata hai

export const handleOutlookWebhook = async (req: any, res: any) => {
    // Step 1: Validation token — Graph pehli baar ye bhejta hai subscription create pe
    if (req.query.validationToken) {
        console.log("Webhook validation received");
        return res.status(200).contentType("text/plain").send(req.query.validationToken);
    }

    // Step 2: Actual notifications
    try {
        const notifications = req.body?.value || [];

        for (const notification of notifications) {
            // clientState verify karo (tamper protection)
            if (notification.clientState !== "sathi_bot_secret") {
                console.warn("Invalid clientState — ignoring");
                continue;
            }

            const resourceData = notification.resourceData;
            const messageId = resourceData?.id;

            // Yahan se tumhara existing processing logic call hoga
            // e.g., processNewEmail(messageId, notification)
            console.log(`New mail notification: ${messageId}`);
        }

        // Graph ko 202 within 3 seconds chahiye, warna retry karega
        return res.status(202).send();
    } catch (error: any) {
        console.error("Webhook error:", error?.message);
        return res.status(202).send(); // still 202, retry se bachne ke liye
    }
};

export const notification = (req: any, res: any) => {
    try {
        const data = req.body;
        return res.status(200).json({
            ok: true
        })
    } catch (error) {
        return res.status(500).json({
            success: false
        })
    }
}