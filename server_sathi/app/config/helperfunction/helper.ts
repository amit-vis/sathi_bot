/**
 * structuralFilter.ts
 *
 * Sirf STRUCTURAL signals pe block karta hai — content/keywords pe NAHI.
 *
 * Structural = mail ki banawat batati hai ki ye 1-to-many bulk mail hai.
 * Koi vendor tumhe List-Unsubscribe header ke saath purchase order nahi bhejta.
 * Isliye yahan false-positive risk ~0 hai.
 *
 * Content ka faisla (business hai ya nahi) LLM karega. Ye uska kaam nahi.
 *
 * FAIL-OPEN: doubt ho to PASS. Missed lead > wasted LLM call.
 */

export interface MailInput {
  messageId: string;
  from: string;
  subject: string;
  body?: string;
  /** Gmail API ka message.labelIds — CATEGORY_PROMOTIONS etc. */
  labelIds?: string[];
  /** Lowercased header map — { "list-unsubscribe": "<...>" } */
  headers?: Record<string, string>;
  [key: string]: any;
}

export interface FilterVerdict {
  blocked: boolean;
  /** Kis rule ne block kiya — logging ke liye. Pass hua to null. */
  rule: string | null;
  /** Debug detail */
  detail?: string;
}

/* ------------------------------------------------------------------ */
/* RULE DATA                                                           */
/* ------------------------------------------------------------------ */

/** Gmail ke apne category labels. Google ki ML — tumhari list se behtar. */
const BLOCKED_LABELS = new Set([
  "CATEGORY_PROMOTIONS",
  "CATEGORY_SOCIAL",
  "CATEGORY_FORUMS",
  "SPAM",
  "TRASH",
]);

/**
 * Ye headers = mail bulk system se nikla hai.
 * RFC 2919/2369. Insaan ka mail client ye kabhi nahi lagata.
 */
const BULK_HEADERS = [
  "list-unsubscribe",
  "list-id",
  "list-post",
  "x-campaign-id",
  "x-mailchimp-id",
  "x-sg-eid",           // SendGrid
  "feedback-id",
];

/** Precedence header ki ye values = bulk. */
const BULK_PRECEDENCE = ["bulk", "list", "junk", "auto_reply"];

/**
 * Domains jinse business mail aata hi nahi.
 * NOTE: yahan ESP domains (mailchimp/sendgrid) jaanboojh ke NAHI hain —
 * bahut se chhote vendors apne genuine order mails bhi SendGrid se bhejte hain.
 * Sirf wo domains jinka product hi consumer/social hai.
 */
const BLOCKED_DOMAINS = [
  // Social
  "linkedin.com", "facebookmail.com", "facebook.com", "twitter.com", "x.com",
  "instagram.com", "pinterest.com", "reddit.com", "quora.com", "discord.com",
  "tiktok.com", "snapchat.com", "threads.net",
  // Content / publishing
  "substack.com", "medium.com", "youtube.com", "spotify.com", "netflix.com",
  "primevideo.com", "hotstar.com",
  // Consumer apps (India-focused)
  "swiggy.in", "zomato.com", "uber.com", "olacabs.com", "rapido.bike",
  "makemytrip.com", "goibibo.com", "ixigo.com", "cleartrip.com",
  "dream11.com", "paytm.com", "phonepe.com",
  // Job boards / recruiters
  "naukri.com", "indeed.com", "glassdoor.com", "monster.com", "shine.com",
];

/**
 * Local-part patterns. Sirf wo jo 100% automated hain.
 * "info@", "sales@", "orders@", "accounts@" YAHAN NAHI —
 * chhote businesses wahi se genuine mail bhejte hain.
 */
const BLOCKED_LOCALPARTS = [
  "noreply", "no-reply", "no_reply", "no.reply",
  "donotreply", "do-not-reply", "do_not_reply",
  "mailer-daemon", "postmaster", "bounce", "bounces",
  "newsletter", "newsletters",
  "unsubscribe",
];

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

const lower = (s: unknown): string =>
  typeof s === "string" ? s.toLowerCase().trim() : "";

/** "Amit <amit@gmail.com>" -> "amit@gmail.com" */
export const extractEmail = (from: unknown): string => {
  const s = lower(from);
  const m = s.match(/<([^>]+)>/);
  return m ? m[1]!.trim() : s;
};

const domainOf = (email: string): string => email.split("@")[1] || "";

/** Sub-domain bhi match kare: "mail.linkedin.com" endsWith "linkedin.com" */
const domainMatches = (domain: string, blocked: string): boolean =>
  domain === blocked || domain.endsWith("." + blocked);

/* ------------------------------------------------------------------ */
/* MAIN                                                                */
/* ------------------------------------------------------------------ */

export const isBulkMail = (mail: MailInput): FilterVerdict => {
  /* --- 1. Gmail ke apne labels --- */
  const labels = Array.isArray(mail.labelIds) ? mail.labelIds : [];
  for (const l of labels) {
    if (BLOCKED_LABELS.has(String(l).toUpperCase())) {
      return { blocked: true, rule: "gmail_label", detail: String(l) };
    }
  }

  /* --- 2. Bulk headers --- */
  if (mail.headers && typeof mail.headers === "object") {
    // headers lowercase-keyed hone chahiye; defensive normalize
    const hdrs: Record<string, string> = {};
    for (const [k, v] of Object.entries(mail.headers)) {
      hdrs[lower(k)] = lower(v);
    }

    for (const h of BULK_HEADERS) {
      if (hdrs[h]) return { blocked: true, rule: "bulk_header", detail: h };
    }

    const prec = hdrs["precedence"];
    if (prec && BULK_PRECEDENCE.includes(prec)) {
      return { blocked: true, rule: "precedence", detail: prec };
    }

    // Auto-replies / OOO
    if (hdrs["auto-submitted"] && hdrs["auto-submitted"] !== "no") {
      return { blocked: true, rule: "auto_submitted", detail: hdrs["auto-submitted"] };
    }
  }

  /* --- 3. Sender domain --- */
  const sender = extractEmail(mail.from);
  const domain = domainOf(sender);

  if (domain) {
    const hit = BLOCKED_DOMAINS.find((d) => domainMatches(domain, d));
    if (hit) return { blocked: true, rule: "blocked_domain", detail: hit };
  }

  /* --- 4. Sender local-part --- */
  const localPart = sender.split("@")[0] || "";
  const lpHit = BLOCKED_LOCALPARTS.find((p) => localPart.includes(p));
  if (lpHit) return { blocked: true, rule: "noreply_sender", detail: sender };

  /* --- Pass --- */
  return { blocked: false, rule: null };
};

/* ------------------------------------------------------------------ */
/* BATCH + LISTS                                                       */
/* ------------------------------------------------------------------ */

export interface FilterOptions {
  /** Ye senders/domains hamesha pass — filter bypass */
  whitelist?: string[];
  /** Ye senders/domains hamesha block */
  blacklist?: string[];
}

export interface FilterOutput {
  /** LLM ko ye bhejo */
  allowed: MailInput[];
  /** Ye label karke chhod do */
  blocked: Array<{ mail: MailInput; rule: string; detail?: string }>;
}

export const filterMail = (
  mails: MailInput[],
  opts: FilterOptions = {}
): FilterOutput => {
  if (!Array.isArray(mails)) return { allowed: [], blocked: [] };

  const wl = (opts.whitelist || []).map(lower).filter(Boolean);
  const bl = (opts.blacklist || []).map(lower).filter(Boolean);

  const matchesList = (sender: string, list: string[]): boolean => {
    const domain = domainOf(sender);
    return list.some(
      (entry) =>
        sender === entry ||                                    // exact address
        (!entry.includes("@") && domainMatches(domain, entry)) // domain entry
    );
  };

  const allowed: MailInput[] = [];
  const blocked: FilterOutput["blocked"] = [];

  for (const mail of mails) {
    const sender = extractEmail(mail?.from);

    // Whitelist sabse upar — kuch bhi ho, pass
    if (wl.length && matchesList(sender, wl)) {
      allowed.push(mail);
      continue;
    }

    if (bl.length && matchesList(sender, bl)) {
      blocked.push({ mail, rule: "blacklist", detail: sender });
      continue;
    }

    const v = isBulkMail(mail);
    if (v.blocked) blocked.push({ mail, rule: v.rule!, detail: v.detail! });
    else allowed.push(mail);
  }

  return { allowed, blocked };
};

/* ------------------------------------------------------------------ */
/* GMAIL API SE labelIds + headers NIKALNE KE LIYE                     */
/* ------------------------------------------------------------------ */

/**
 * Ye tumhare getmessages() me use karo.
 * Gmail ka messages.get response object pass karo.
 *
 *   const res = await gmail.users.messages.get({ userId: "me", id, format: "full" });
 *   const { labelIds, headers } = extractGmailMeta(res.data);
 */
export const extractGmailMeta = (gmailMessage: any) => {
  const headers: Record<string, string> = {};
  const rawHeaders = gmailMessage?.payload?.headers || [];

  for (const h of rawHeaders) {
    if (h?.name) headers[String(h.name).toLowerCase()] = String(h.value ?? "");
  }

  return {
    labelIds: (gmailMessage?.labelIds || []) as string[],
    headers,
  };
};

/**
 * Sirf classification ke liye chahiye to `format: "metadata"` use karo —
 * body download hi nahi hoga, 5x faster + kam quota.
 *
 *   gmail.users.messages.get({
 *     userId: "me", id, format: "metadata",
 *     metadataHeaders: ["From", "Subject", "List-Unsubscribe", "List-Id", "Precedence"]
 *   })
 *
 * Jo mails pass ho jayein, sirf unka full body fetch karo.
 * Isse 50-60% mails ka body kabhi download hi nahi hoga.
 */
export const CLASSIFY_HEADERS = [
  "From", "Subject", "Date",
  "List-Unsubscribe", "List-Id", "List-Post",
  "Precedence", "Auto-Submitted", "Feedback-ID",
];

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function calculateCompleteness(data: any): number {
  let total = 0, filled = 0;

  function walk(obj: any) {
    if (obj === null || obj === undefined) return;
    if (Array.isArray(obj)) {
      obj.forEach(walk);
    } else if (typeof obj === "object") {
      for (const key in obj) walk(obj[key]);
    } else {
      total++;
      if (obj !== "" && obj !== null) filled++;
    }
  }

  walk(data);
  return total > 0 ? Math.round((filled / total) * 100) : 0;
}

export function extractTokenUsage(result: any) {
  const messages = result?.messages ?? [];
  const lastAI = [...messages].reverse().find((m: any) =>
    m?.usage_metadata || m?.response_metadata?.usage
  );

  const usage = lastAI?.usage_metadata ?? lastAI?.response_metadata?.usage;

  return {
    input_tokens: usage?.input_tokens ?? usage?.prompt_tokens ?? null,
    output_tokens: usage?.output_tokens ?? usage?.completion_tokens ?? null,
    total_tokens: usage?.total_tokens ?? null,
  };
}