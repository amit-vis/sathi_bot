import axios from "axios";
import { createUser, getUserByMail, getUserDatasubscription, updatewtchExpire, updatOTP, updatTokens } from "../model/user.js";
import { decryptionToken, encryptToken, sendOTP } from "../config/helperfunction/userHelper.js";
import bcrypt from "bcryptjs";
import { sendOTPackGmailQueue } from "./queue/gmailQueue.js";
import { msQueue } from "./queue/msQueueExtract.js";
import logger from "../utils/logger.js";

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
        return res.redirect(authUrl);
    } catch (error: any) {
        logger.error("Error in outlook redirect", {
            type: "HOTMAIL_OAUTH",
            action: "redirectMicrosoft",
            error: error.message
        });
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
        
        logger.info("Microsoft folder created successfully", {
            type: "OUTLOOK_FOLDER",
            action: "createFolder",
            details: { folderName: folderName, folderId: newFolderId }
        });
        
        return newFolderId;
    } catch (error: any) {
        const isConflict = error.response?.status === 409 || error.response?.data?.error?.code === "ErrorFolderExists";
        if (isConflict) {
            const listResponse = await axios.get(`https://graph.microsoft.com/v1.0/me/mailFolders`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const existingFolder = listResponse.data.value.find(
                (f: any) => f.displayName.toLowerCase() === folderName.toLowerCase()
            );
            if (existingFolder) return existingFolder.id;
        }
        
        logger.error(`Error creating folder ${folderName}`, {
            type: "OUTLOOK_FOLDER",
            action: "createFolder", 
            error: error.message
        });
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

        return {
            email: response.data.userPrincipalName || response.data.mail,
            name: response.data.displayName
        };
    } catch (error: any) {
        logger.error("Failed to fetch user info from Microsoft", {
            type: "OUTLOOK_AUTH",
            action: "fetchUserInfoMicrosoft",
            error: error.message
        });
    }
}
const newExpiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

export const Subscription = async (accessToken: string) => {
    const resData = await axios.post(`https://graph.microsoft.com/v1.0/subscriptions`, {
        changeType: "created,updated",
        notificationUrl: "https://annmarie-nonextractable-mathematically.ngrok-free.dev/app/hotmail/notification",
        resource: "me/mailFolders('Inbox')/messages",
        expirationDateTime: newExpiration.toISOString(),
        clientState: "BizNest_bot_secret",
    }, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    return resData.data.id
}

export const callbackUrlMicrosoft = async (req: any, res: any) => {
    try {
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
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        );
        
        const msAccessToken = tokenResponse.data.access_token;
        const msRefreshToken = tokenResponse.data.refresh_token;
        const expiresInMs = tokenResponse.data.expires_in * 1000;
        const expiresAt = new Date(Date.now() + expiresInMs);
        let user;
        let UserInfo;
        const folderNames = ["bot_accessed", "bot_blocked"];
        let folderId = [];
        
        try {
              console.log("STEP 1: Fetching user info...");
            UserInfo = await fetchUserInfoMicrosoft(msAccessToken);
               console.log("STEP 2: User info fetched:", UserInfo?.email);
            user = await getUserByMail(UserInfo?.email);
                console.log("STEP 3: User lookup done, exists:", !!user);

            const otp = sendOTP();
            const encryptOTP = await bcrypt.hashSync(otp, 10);
            const futeureMinute = 10 * 60 * 1000;
            const otpExpireTimestamp = new Date(Date.now() + futeureMinute);
            const encryptedAccessToken = encryptToken(msAccessToken);
            const encryptedRefrshToken = encryptToken(msRefreshToken);
            
            if (user) {
                user = await updatTokens(UserInfo?.email, {
                    AccessToken: encryptedAccessToken,
                    mailRefreshToken: encryptedRefrshToken,
                    ExpiryTimestamp: expiresAt,
                });

                await updatOTP(UserInfo?.email, {
                    otpCode: encryptOTP || null,
                    otpExpiresAt: otpExpireTimestamp || null
                });
                
                logger.info("Existing Outlook user tokens updated", {
                    type: "USER_AUTH",
                    action: "callbackUrlMicrosoft",
                    email: UserInfo?.email
                });
            } else {
                const subscriptionId = await Subscription(msAccessToken);
                for (const label of folderNames) {
                    const labelId = await createFolder(msAccessToken, label);
                    folderId.push(labelId);
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
                    msSubscriptionId: subscriptionId,
                    isEmailVerified: true,
                    mailType: "outlook"
                });

                await sendOTPackGmailQueue.add("onboard-mail", {
                    type: "onboard",
                    to: UserInfo?.email,
                    userName: UserInfo?.name
                }, { priority: 10 });
                
                logger.info("New Outlook user onboarded successfully", {
                    type: "USER_AUTH",
                    action: "callbackUrlMicrosoft",
                    email: UserInfo?.email
                });
            }
            
            await sendOTPackGmailQueue.add("otp-sent", {
                type: "otp",
                to: UserInfo?.email,
                otp: otp
            }, { priority: 1 });
            
        } catch (error: any) {
            logger.error("Failed to process Outlook user info in callback", {
                type: "USER_AUTH",
                action: "callbackUrlMicrosoft",
                error: error.message
            });
            return res.status(500).json({ error: "Authentication failed" });
        }

        return res.redirect(`${process.env.FRONTEND_URL}/otp?email=${encodeURIComponent(UserInfo?.email)}`);
    } catch (error: any) {
        logger.error("Outlook callback general error", {
            type: "USER_AUTH",
            action: "callbackUrlMicrosoft",
            error: error?.response?.data || error.message
        });
        return res.status(500).json({ error: "Authentication failed" });
    }
}

const BUFFER_MS = 2 * 60 * 1000;

export const generateNewAccessTokenOutlook = async (userMail: string) => {
    try {
        const currentTimeStamp = Date.now() + BUFFER_MS;
        const record = await getUserByMail(userMail.trim().toLowerCase());
        
        if (!record) {
            logger.warn("User not found for Outlook token generation", {
                type: "TOKEN_GENERATION",
                action: "generateNewAccessTokenOutlook",
                email: userMail
            });
            return null;
        }

        if (record.AccessToken && record.ExpiryTimestamp && record.ExpiryTimestamp.getTime() > currentTimeStamp) {
            return decryptionToken(record.AccessToken);
        }

        if (!record.mailRefreshToken) {
            logger.error("No refresh token available, re-authorization needed for Outlook", {
                type: "TOKEN_GENERATION",
                action: "generateNewAccessTokenOutlook",
                email: userMail
            });
            return null;
        }

        const refreshToken = decryptionToken(record.mailRefreshToken);

        const response = await axios.post(
            'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            new URLSearchParams({
                client_id: process.env.MICROSOFT_CLIENT_ID!,
                client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
                scope: 'https://graph.microsoft.com/.default offline_access',
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const newAccessToken = response.data.access_token;
        const expiresAt = new Date(Date.now() + response.data.expires_in * 1000);

        const updateData: any = {
            AccessToken: encryptToken(newAccessToken),
            ExpiryTimestamp: expiresAt,
        };
        
        if (response.data.refresh_token) {
            updateData.mailRefreshToken = encryptToken(response.data.refresh_token);
        }
        await updatTokens(userMail, updateData);
        
        logger.info("Outlook access token refreshed successfully", {
            type: "TOKEN_GENERATION",
            action: "generateNewAccessTokenOutlook",
            email: userMail
        });

        return newAccessToken;
    } catch (error: any) {
        logger.error("Outlook token refresh failed", {
            type: "TOKEN_GENERATION",
            action: "generateNewAccessTokenOutlook",
            email: userMail,
            error: error?.response?.data || error?.message
        });
        return null;
    }
};

// ─── Unread Messages ───

const getMessageId = async (accessToken: string, nextLink: string | null = null) => {
    try {
        let url = nextLink || `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages`;
        
        const config: any = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        };

        if (!nextLink) {
            config.params = {
                $filter: "isRead eq false and receivedDateTime ge 2026-07-15T00:00:00Z and NOT (categories/any(c: c eq 'bot_accessed')) and NOT (categories/any(c: c eq 'bot_blocked'))",
                $select: "id",
                $top: 100,
                $orderby: "receivedDateTime desc",
            };
        }

        const response = await axios.get(url, config);

        const messages = (response.data.value || []).map((m: any) => ({ id: m.id }));
        const nextPageLink: string | null = response.data["@odata.nextLink"] || null;

        return { messages, nextPageToken: nextPageLink };
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
        logger.error(`Error marking as processed`, { error: error?.message });
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
        logger.error(`Error marking as bot_blocked`, { error: error?.message });
        const status = error?.response?.status;
        console.error(`Error marking as bot_blocked (${status}):`, error?.message);
        if (status === 403) {
            console.log(`  PERMISSION ERROR — add Mail.ReadWrite scope in Azure Portal`);
        }
        return false;
    }
};

// ─── Attachments ───

const getAttachment = async (
  messageId: string,
  accessToken: string,
  maxFileSize?: number
) => {
  try {
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const attachments = [];
    for (const att of response.data.value || []) {
      if (
        att["@odata.type"] === "#microsoft.graph.fileAttachment" &&
        !att.isInline &&
        (!maxFileSize || att.size <= maxFileSize)
      ) {
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
  if (message.body?.content) {
    if (message.body.contentType === "text") {
      return message.body.content;
    }
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
          $select:
            "id,conversationId,from,subject,body,receivedDateTime,isRead,categories,internetMessageHeaders,hasAttachments",
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
      body: getMessageBody(msg),
      date: new Date(msg.receivedDateTime).toLocaleString(),
      internalDate: new Date(msg.receivedDateTime).getTime(),
      categories: msg.categories || [],
      headers: headerMap,
      isUnread: !msg.isRead,
      extracted_at: new Date(),
    };

    if (config?.includeAttachments && msg.hasAttachments) {
      extracted.attachments = await getAttachment(
        messageId,
        accessToken,
        config?.maxFileSize
      );
      extracted.attachmentCount = extracted.attachments.length;
    } else {
      extracted.attachments = [];
      extracted.attachmentCount = 0;
    }

    return extracted;
  } catch (error: any) {
    console.error(
      "Get message error:",
      error?.response?.data || error?.message
    );
    return null;
  }
};

// ─── Real-time Push Notifications (Gmail Watch → Graph Subscription) ───

export const mailAccessRealTimeOutlook = async (userEmail: string) => {
    const accessToken = await generateNewAccessTokenOutlook(userEmail);
    if (!accessToken) {
        logger.error("Skipping watch registration due to missing token", {
            type: "OUTLOOK_WATCH",
            action: "mailAccessRealTimeOutlook",
            email: userEmail
        });
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
                clientState: "BizNest_bot_secret",                     // webhook verify karne ke liye
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log(`Subscription registered for ${userEmail}:`, resdata.data);
        logger.info("Outlook subscription registered successfully", {
            type: "OUTLOOK_WATCH",
            action: "mailAccessRealTimeOutlook",
            email: userEmail
        });
        const subscriptionId = resdata.data.id;
        const expirationString = resdata.data.expirationDateTime;

        // ✅ Convert ISO string to Date object for Prisma
        const expirationDate = new Date(expirationString);
        await updatewtchExpire(expirationDate, userEmail, subscriptionId)
        return resdata.data;

        // ⚠️ IMPORTANT: resdata.data.id save karo DB mein —
        // renew/delete ke liye subscription ID chahiye
    } catch (error: any) {
        logger.error("Outlook subscription registration failed", {
            type: "OUTLOOK_WATCH",
            action: "mailAccessRealTimeOutlook",
            email: userEmail,
            error: error?.response?.data || error?.message
        });
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
        logger.info("Outlook subscription renewed successfully", {
            type: "OUTLOOK_WATCH",
            action: "renewSubscription",
            email: userEmail
        });
        return response.data;
    } catch (error: any) {
        console.error("Renew failed:", error?.response?.data || error?.message);
        logger.error("Outlook subscription renewal failed", {
            type: "OUTLOOK_WATCH",
            action: "renewSubscription",
            email: userEmail,
            error: error?.response?.data || error?.message
        });
        return null;
    }
};

// ─── Get Message Metadata ───

const CLASSIFY_HEADERS_OUTLOOK = "id,conversationId,from,subject,receivedDateTime,categories,internetMessageHeaders";
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getMessageMeta = async (accessToken: string, messageId: string) => {
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

export const fetchAllMeta = async (accessToken: string, messageIds: string[]) => {
    const results: any[] = [];
    const batchSize = 4; // Microsoft ka concurrent limit

    for (let i = 0; i < messageIds.length; i += batchSize) {
        const batch = messageIds.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(id => getMessageMeta(accessToken, id))
        );
        results.push(...batchResults.filter(Boolean));

        // Har batch ke baad 1 second ruk
        if (i + batchSize < messageIds.length) {
            await delay(1000);
        }
    }

    return results;
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
        logger.info("Outlook watch stopped successfully", {
            type: "OUTLOOK_WATCH",
            action: "stopUserWatch",
            email: getUser.userEmail
        });

        return res.status(200).json({
            message: "User subscription stopped successfully!",
            success: true,
        });
    } catch (error: any) {
        logger.error("Error stopping Outlook watch", {
            type: "OUTLOOK_WATCH",
            action: "stopUserWatch",
            error: error?.response?.data || error?.message
        });
        return res.status(500).json({
            message: "Error stopping subscription",
            error: error?.response?.data || error?.message,
        });
    }
};

// // ─── Webhook Endpoint (notifications receive karne ke liye) ───
// // Gmail mein Pub/Sub topic pe message aata hai,
// // Outlook mein tumhare notificationUrl pe POST aata hai

export const notification = async (req: any, res: any) => {
  if (req.query.validationToken) {
        console.log("Webhook validation received");
        return res.status(200).contentType("text/plain").send(req.query.validationToken);
    }

    // Step 2: Actual notifications
    try {
        const notifications = req.body?.value || [];

        for (const notifi of notifications) {
            // clientState verify karo (tamper protection)
            if (notifi.clientState !== "BizNest_bot_secret") {
                logger.warn("Invalid clientState in webhook notification", {
                    type: "OUTLOOK_WEBHOOK",
                    action: "notification"
                });
                console.warn("Invalid clientState — ignoring");
                continue;
            }

            const subscriptionId = notifi.subscriptionId;
             const messageId = notifi.resourceData?.id

            const userData = await getUserDatasubscription(subscriptionId);
            if (userData) {
                await msQueue.add("msSync", { emailAddress: userData?.userEmail, userId: userData?.id }, {
                    jobId: `${userData?.userEmail}-${messageId}`
                });
                
                logger.info("Outlook push notification processed", {
                    type: "OUTLOOK_WEBHOOK",
                    action: "notification",
                    email: userData?.userEmail
                });
            }
            // Yahan se tumhara existing processing logic call hoga
            // e.g., processNewEmail(messageId, notification)
            console.log(`New mail notification: ${subscriptionId}`);
        }

        // Graph ko 202 within 3 seconds chahiye, warna retry karega
        return res.status(202).send();
    } catch (error: any) {
        logger.error("Outlook webhook notification error", {
            type: "OUTLOOK_WEBHOOK",
            action: "notification",
            error: error?.message
        });
        console.error("Webhook error:", error?.message);
        return res.status(202).send(); // still 202, retry se bachne ke liye
    }
}