import crypto from "crypto"
export const sendOTP = () => {
  const min = 100000
  const max = 999999
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  const otp = String(Math.floor(Math.random() * (maxFloor - minCeil)) + minCeil)
  return otp
}

const algorithem = "aes-256-cbc";
const secretKey = Buffer.from(process.env.ENCRYPTION_SECRET_KEY!, "hex");
const ivLength = 16

export const encryptToken = (token: any) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithem, secretKey, iv);
  let encypted = cipher.update(token, "utf8", "hex");
  encypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encypted
}


export const decryptionToken = (encypttoken: any) => {
  const parts = encypttoken?.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedTex = parts.join(":");
  const decypher = crypto.createDecipheriv(algorithem, secretKey, iv);
  let decrypted = decypher.update(encryptedTex, "hex", "utf8");
  decrypted += decypher.final("utf8");
  return decrypted
}

export const buildWhere = (identifier: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(identifier)) {
    return { userEmail: identifier };
  }
  if (uuidRegex.test(identifier)) {
    return { id: identifier };
  }
  // baaki sab ko phone number maano
  return { userMobileNumber: identifier };
};

export const PinGenerator = ()=>{
  const min = 100000
  const max = 999999
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  const pin = String(Math.floor(Math.random() * (maxFloor - minCeil)) + minCeil)
  return pin
}

// Helper to detect provider
export const getEmailProvider = (email: string): "gmail" | "outlook" | "unknown" => {
    const domain = email.split("@")[1]?.toLowerCase() as string;
    if (["gmail.com", "googlemail.com"].includes(domain)) return "gmail";
    if (["hotmail.com", "outlook.com", "live.com", "msn.com"].includes(domain)) return "outlook";
    return "unknown";
};

// IP extract karne ka sahi tarika
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded?.split(",")[0]?.trim() as string; // pehla IP = actual client
  }
  // fallback for direct connections
  return req.headers.get("x-real-ip") || "unknown";
}