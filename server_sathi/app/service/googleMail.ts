import axios from "axios";
import path from "node:path";
import fs from "fs"

let cachedAccessToken: string | null = null;
let tokenGeneratedAt: number = 0;
const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000;  // 55 minutes in milliseconds

export const redirecTGmail = async (req: any, res:any)=>{
    try {
        const userId = "User122";
        
        const params = new URLSearchParams({
            client_id: process.env.GMAIL_CLIENT_ID!,
            redirect_uri: process.env.GMAIL_REDIRECT_URI!,
            response_type: "code",
            scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify",
            access_type:"offline",
            state: userId
        })
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
        return res.redirect(authUrl)
    } catch (error) {
        console.error(error)
    }
}

export const callbackUrl = async (req: any, res: any)=>{
    try {
        const {code} = req.query;
        const userId = "User122";
        const tokenresponse = await axios.post(
            `https://oauth2.googleapis.com/token`,
            {
                client_id: process.env.GMAIL_CLIENT_ID,
                client_secret: process.env.GMAIL_CLIENT_SECRET,
                code: code,
                redirect_uri: process.env.GMAIL_REDIRECT_URI,
                grant_type: 'authorization_code'
            }
        );
        const gmailToken = tokenresponse.data.access_token;
    const gmailRefreshToken = tokenresponse.data.refresh_token;
    const gmailExpiry = tokenresponse.data.expires_in;
    console.log(`ghfdfds`, gmailToken,gmailRefreshToken,gmailExpiry)
    return res.redirect(`/dashboard?userId=${userId}&provider=gmail&success=true`)
    } catch (error) {
        
    }
}

export const generateNewAccessToken = async () => {
    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GMAIL_CLIENT_ID,
            client_secret: process.env.GMAIL_CLIENT_SECRET,
            refresh_token: process.env.REFRESH_TOKEN,
            grant_type: 'refresh_token'
        });

        cachedAccessToken = response.data.access_token;
        tokenGeneratedAt = Date.now();

        console.log(`✅ Fresh Access Token Generated at ${new Date().toLocaleTimeString()}`);
        console.log(`⏰ Next refresh: ${new Date(tokenGeneratedAt + TOKEN_REFRESH_INTERVAL).toLocaleTimeString()}`);
        
        return cachedAccessToken;

    } catch (error: any) {
        console.error("❌ Token refresh failed:", error?.response?.data || error?.message);
        cachedAccessToken = null;
        return null;
    }
}

// ===== CHECK IF TOKEN STILL VALID =====
const isTokenValid = (): boolean => {
    if (!cachedAccessToken) {
        console.log("🔴 No cached token");
        return false;
    }

    const tokenAge = Date.now() - tokenGeneratedAt;
    const minutesOld = Math.floor(tokenAge / 60000);
    
    if (tokenAge > TOKEN_REFRESH_INTERVAL) {
        console.log(`🔴 Token expired (${minutesOld} minutes old)`);
        return false;
    }

    console.log(`🟢 Token valid (${minutesOld} minutes old, refresh in ${55 - minutesOld} min)`);
    return true;
}

// ===== GET TOKEN (Cache first, refresh if needed) =====
export const getAccessToken = async (): Promise<string | null> => {
    if (isTokenValid()) {
        return cachedAccessToken;
    }
    
    console.log("🔄 Refreshing access token...");
    return await generateNewAccessToken();
}

// ===== AUTO REFRESH (Background mein har 55 min) =====
export const startTokenAutoRefresh = () => {
    console.log("🕐 Starting auto token refresh (every 55 minutes)");
    
    setInterval(async () => {
        console.log(`\n⏰ Auto-refresh triggered at ${new Date().toLocaleTimeString()}`);
        await generateNewAccessToken();
    }, TOKEN_REFRESH_INTERVAL);
}


const getMessageId = async (accessToken: string, pageToken: string | null = null) => {
    try {
        const params: any = {
            q: "is:unread -label:bot_accessed category:primary after:2026/07/15",
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
        console.error('❌ Gmail API error:', error.message);
        return { messages: [], nextPageToken: null };
    }
}
const getAllUnreadMessages = async (accessToken: string) => {
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
            await new Promise(r => setTimeout(r, 500));  // 500ms wait
        }

    } while (pageToken);

    console.log(`📊 Total Unread: ${allMessages.length}`);
    return allMessages;
}

// ===== NEW: Mark as read =====
const markAsReadBatch = async (
    accessToken: string,
    messageIds: string[]  // ✅ Array parameter
) => {
    try {
        if (messageIds.length === 0) {
            return true;
        }

        console.log(`🔄 Marking ${messageIds.length} messages as read...`);
        
        const response = await axios.post(
            `https://www.googleapis.com/gmail/v1/users/me/messages/batchModify`,
            {
                "ids": messageIds,  // ✅ Array of IDs
                "addLabelIds": ["Label_2630179948354553205"]
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
        console.error(`❌ Error marking as read (${status}):`, error?.message);
        
        if (status === 403) {
            console.log(`\n⚠️  PERMISSION ERROR (403)`);
            console.log(`   This likely means missing Gmail OAuth scope`);
            console.log(`   FIX:`);
            console.log(`   1. Go to Google Cloud Console`);
            console.log(`   2. Add scope: gmail.modify`);
            console.log(`   3. Generate new refresh token`);
        }
        
        if (status === 400) {
            console.log(`\n⚠️  BAD REQUEST (400)`);
            console.log(`   Message IDs format issue`);
        }
        
        return false;
    }
}

const getAttachment = async (messagesId: any, parts: any, accessToken: any) => {
    try {
        if (!parts) return [];
        const savedFiles = [];
        for (const part of parts) {
            if (part.filename && part.body && part.body.attachmentId) {
                const filename = part.filename;
                const attachementId = part.body.attachmentId;
                console.log(`📎 Attachment: ${filename}`);
                try {
                    const response = await axios.get(
                        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messagesId}/attachments/${attachementId}`,
                        {
                            headers: {
                                "Authorization": `Bearer ${accessToken}`
                            }
                        }
                    )

                    const attachmentData = response.data.data;
                    const fileBuffer = Buffer.from(attachmentData, 'base64url');
                    const savePath = path.join(process.cwd(), 'attachments', filename);

                    // Folder create karo agar exist na kare
                    if (!fs.existsSync(path.dirname(savePath))) {
                        fs.mkdirSync(path.dirname(savePath), { recursive: true });
                    }

                    fs.writeFileSync(savePath, fileBuffer);
                    console.log(`✅ Saved: ${savePath}`);
                    savedFiles.push(savePath);
                } catch (error: any) {
                    console.error(`❌ Error: ${filename}`, error?.message);
                }
            }
        }

        return savedFiles
    } catch (error) {
        console.error('Attachment error:', error);
        return [];
    }
}
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

const getmessages = async (
    accessToken: string,
    messageId: string,
    config?: ExtractionConfig  // ✅ ADD config parameter
) => {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const payload = response.data.payload;
        const headers = payload.headers;
        const labels = response.data.labelIds || [];
        const internalDate = response.data.internalDate;

        // Extract basic data
        const extracted: any = {
            messageId,
            from: headers.find((h: any) => h.name === 'From')?.value || "Unknown",
            subject: headers.find((h: any) => h.name === 'Subject')?.value || "No Subject",
            body: getMessageBody(payload),
            date: new Date(parseInt(internalDate)).toLocaleString(),
            isUnread: labels.includes('UNREAD'),
            extracted_at: new Date(),
        };

        // ✅ CONDITIONAL: Only if config says include attachments
        if (config?.includeAttachments && payload?.parts) {
            console.log(`📎 Found attachments, downloading...`);
            
            extracted.attachments = await getAttachment(
                messageId,
                payload.parts,
                accessToken
            );
            extracted.attachmentCount = extracted.attachments?.length || 0;
        } else {
            extracted.attachments = [];
            extracted.attachmentCount = 0;
        }

        return extracted;
        
    } catch (error: any) {
        console.error('❌ Get message error:', error?.message);
        return null;
    }
}


// ===== FIXED NOTIFICATION HANDLER =====
export const notification = async (req: any, res: any) => {
    try {
        console.log(`\n⏰ Notification received at: ${new Date().toLocaleTimeString()}`);
        
        const encodeddata = req.body.message.data;
        const decodedString = Buffer.from(encodeddata, 'base64').toString('utf-8');
        const payload = JSON.parse(decodedString);

        const accessToken = await getAccessToken();
        if (!accessToken) {
            return res.status(401).json({ message: "Token refresh failed" });
        }

        console.log('⏳ Waiting 2 seconds for Gmail to sync...');
        await new Promise(r => setTimeout(r, 2000));

        const allMessages = await getAllUnreadMessages(accessToken);
        
        let emailContent: any[] = [];
        const idsToMarkAsRead: string[] = [];  // ✅ Collect all IDs
        
        if (allMessages && allMessages.length > 0) {
            console.log(`🔄 Processing ${allMessages.length} messages...`);
            
            for (const message of allMessages) {
                try {
                    const data = await getmessages(accessToken, message.id, {
                        includeAttachments: true,
                        maxFileSize: 10*1024*1024
                    });
                    if (data) {
                        emailContent.push(data);
                        idsToMarkAsRead.push(message.id);  // ✅ Collect ID
                    }
                } catch (err) {
                    console.error(`Error: ${message.id}:`, err);
                }
            }
            
            // ✅ BATCH mark as read - SINGLE API call
            if (idsToMarkAsRead.length > 0) {
                console.log(`🔄 Marking ${idsToMarkAsRead.length} messages as read...`);
                await markAsReadBatch(accessToken, idsToMarkAsRead);
                console.log(`✅ Processed: ${emailContent.length}/${allMessages.length}`);
            }

            console.log("here is the email", emailContent)
        } else {
            console.log("ℹ️  No unread messages found");
        }

        return res.status(200).json({
            message: "Processed successfully",
            totalUnread: allMessages.length,
            totalProcessed: emailContent.length,
            emails: emailContent,
        })
        
    } catch (error) {
        console.error("❌ Notification error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}

export const mailaccesRealTime = async (req: any, res: any) => {
    const accessToken = await getAccessToken();
    try {
        const resdata = await axios.post(
            `https://www.googleapis.com/gmail/v1/users/me/watch`,
            {
                "labelIds": ["INBOX"],
                "topicName": "projects/project-4d61adc1-429a-40ef-bfe/topics/sathi_bot_automation"
            },
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        )
        return res.status(200).json({
            message: "Connected successfully!",
            data: resdata.data
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error?.message
        })
    }
}

export const getLabels = async () => {
    const accessToken = await generateNewAccessToken();
    const response = await axios.get(`https://www.googleapis.com/gmail/v1/users/me/labels`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });
    console.log("Label List:", response.data.labels);
}