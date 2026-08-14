
import { createAgent, toolStrategy } from "langchain";
import { ChatVertexAI } from "@langchain/google-vertexai";
import * as z from "zod";
import mammoth from "mammoth";      // docx → text
import * as XLSX from "xlsx";       // xlsx/xls/csv → text
import { Buffer } from "buffer";
import { HumanMessage } from "@langchain/core/messages";
import { calculateCompleteness, extractTokenUsage } from "../config/helperfunction/helper.js";


const llm = new ChatVertexAI({
  model: process.env.MODEL!,
  vertexai: true,
  location: process.env.LOCATION!,
  authOptions: {
    projectId: process.env.PROJECT_ID!
  },
  temperature: 0,
  topP: 0.1
});

// console.log("here is the env ", process.env?.MODEL,process.env.LOCATION, process.env.PROJECT_ID)

const verdictSchema = z.object({
  isBusiness: z.boolean().describe("true if genuine business email"),
  type: z.enum([
    "sales_inquiry", "purchase_order", "invoice", "payment", "lead",
    "quotation", "shipping", "support", "meeting", "contract",
    "other_business", "none",
  ]),
  confidence_score: z.number().min(0).max(100).nullable()
    .describe("Your honest confidence (0-100) that this extraction is accurate. Lower this significantly if the document was blurry, handwritten, had unusual formatting, or if you had to guess any values."),
});

const agent = createAgent({
  model: llm,
  tools: [],
  responseFormat: toolStrategy(verdictSchema, {
    handleError: (error) => {
      console.error("verdict error:", error);
      return "Return a valid classification with isBusiness and type.";
    },
  }),
});



const systemPrompt = `
### ROLE
You are an email classifier for a business automation system. Your job is to decide whether an incoming email is a genuine BUSINESS email that needs data extraction, and if so, what TYPE it is.

### WHAT COUNTS AS A BUSINESS EMAIL
Mark as business (isBusiness: true) if the email relates to any of these types:

- "sales_inquiry"    : Someone asking about products/services, requesting a quote, pricing, or availability.
- "purchase_order"   : A confirmed order, purchase order (PO), or order confirmation.
- "invoice"          : An invoice, bill, or payment request from a vendor/supplier.
- "payment"          : Payment confirmation, receipt, transaction, or remittance advice.
- "lead"             : A new potential customer showing interest, contact form submission, or demo request.
- "quotation"        : A price quote or estimate being sent or requested.
- "shipping"         : Shipment, dispatch, delivery, tracking, or logistics update for an order.
- "support"          : A customer raising a service issue, complaint, or support request about a product/order.
- "meeting"          : A business meeting request, scheduling, or calendar invite from a real person.
- "contract"         : Agreements, proposals, terms, or contract-related correspondence.
- "other_business"   : Clearly business-related but doesn't fit the above.

### WHAT IS NOT A BUSINESS EMAIL
Mark as NOT business (isBusiness: false) if the email is:
- Marketing, newsletters, promotions, or advertisements
- Social media notifications
- Automated system alerts unrelated to a transaction (e.g. login alerts, password resets)
- Spam, phishing, or bulk mailers
- Personal, casual, or non-commercial messages
- Job applications / recruitment (unless your business is hiring-focused)

### HOW TO DECIDE
- Read the sender, subject, and body carefully.
- Judge by INTENT and CONTENT, not just keywords. A newsletter mentioning "invoice" is still marketing.
- If it is genuinely ambiguous but could plausibly be business, lean towards isBusiness: true (a missed lead is worse than an extra check).


### ATTACHMENT RULE (IMPORTANT)
- If the email has one or more document attachments (PDF, image, Word, Excel), 
  treat this as a STRONG signal of business intent — even if the subject and body 
  are empty, vague, or look like random/garbage text.
- Business documents (invoices, orders, receipts) are very often sent with little 
  or no message body, where the real content lives entirely in the attachment.
- In such cases DO NOT block. Lean towards isBusiness: true so the attachment 
  can be extracted and verified downstream.
- Only mark isBusiness: false when there is NO attachment AND the text is clearly 
  non-business (marketing, spam, personal chat).

### OUTPUT FORMAT
Respond with ONLY a valid JSON object. No explanation, no markdown, no extra text.

{
  "isBusiness": true or false,
  "type": one of the type strings above, or "none" if isBusiness is false
}

### EXAMPLES
Email: "Hi, we'd like to order 500 units of your product. Please confirm availability."
Output: { "isBusiness": true, "type": "purchase_order" }

Email: "50% OFF this weekend only! Shop now before stock runs out."
Output: { "isBusiness": false, "type": "none" }

Email: "Please find attached invoice #INV-2024-891 for services rendered. Due in 30 days."
Output: { "isBusiness": true, "type": "invoice" }
`;

export const checkVerdict = async (mail: any) => {
  try {
    const attachments = mail.attachments ?? [];
    const attachmentInfo =
      attachments.length > 0
        ? attachments
            .map((a: any) => `- ${a.filename || "unnamed"} (${a.mimeType || "unknown"})`)
            .join("\n")
        : "(none)";

    // ✅ EARLY EXIT: attachment hai but subject+body dono empty → seedha business maano
    const hasAttachments = attachments.length > 0;
    const hasBody = !!(mail.body && mail.body.trim().length > 0);
    const hasSubject = !!(mail.subject && mail.subject.trim().length > 0 && mail.subject.trim().toLowerCase() !== "no subject");

    if (hasAttachments && !hasBody && !hasSubject) {
      console.log(`⚡ Fast-pass: ${attachments.length} attachment(s) with empty subject+body — skipping LLM, marking as business`);
      return {
        data: {
          isBusiness: true,
          type: "other_business" as const,
          confidence_score: 70,
        },
        _meta: {
          token_usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
          completeness_percent: 100,
          document_type: "other_business",
          extracted_at: new Date(),
        },
      };
    }

    const userContent = `
From: ${mail.from}
Subject: ${mail.subject}
Body:
${(mail.body || "").slice(0, 3000)}

Attachments (${attachments.length}):
${attachmentInfo}
`.trim();

    console.log("📨 Verdict input:\n", userContent); // debug log

    const response = await agent.invoke({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const extractedData = response.structuredResponse ?? null;
    if (!extractedData) return null;

    // ✅ SAFETY NET: LLM ne block kiya but attachments hain → override
    if (!extractedData.isBusiness && hasAttachments) {
      console.log(
        `⚠️ LLM said not business but ${attachments.length} attachment(s) found — overriding to business`
      );
      extractedData.isBusiness = true;
      extractedData.type = extractedData.type === "none" ? "other_business" : extractedData.type;
      extractedData.confidence_score = Math.min(extractedData.confidence_score ?? 50, 50);
    }

    const tokenUsage = extractTokenUsage(response);
    const completeness = calculateCompleteness(extractedData);
    return {
      data: extractedData,
      _meta: {
        token_usage: tokenUsage,
        completeness_percent: completeness,
        document_type: extractedData.type,
        extracted_at: new Date(),
      },
    };
  } catch (error) {
    console.error("checkVerdict error:", error);
    return {
      data: { isBusiness: true, type: "other_business", confidence_score: null },
      _meta: {
        token_usage: {},
        completeness_percent: 0,
        document_type: "other_business",
        extracted_at: new Date(),
      },
    };
  }
};
const universalDocumentSchema = z.object({
  document_type: z
    .enum([
      "invoice", "bill", "purchase_order", "sales_order", "quotation",
      "payment", "expense", "receipt", "credit_note", "debit_note", "other",
    ])
    .nullable()
    .describe(
      "Type of document. Keywords: 'Tax Invoice'=invoice, 'Bill'=bill, 'Purchase Order'/'PO'=purchase_order, 'Sales Order'/'Order Confirmation'=sales_order, 'Quotation'/'Estimate'=quotation, 'Payment'/'Payments Made'=payment, 'Expense'=expense, 'Receipt'=receipt, 'Credit Note'=credit_note, 'Debit Note'=debit_note"
    ),
 
  document_number: z
    .string()
    .nullable()
    .describe("The main document number. Keywords: 'Invoice No', 'Bill#', 'PO#', 'Sales Order#', 'Quotation#', 'Payment#', 'Ref No'"),
 
  document_date: z
    .string()
    .nullable()
    .describe("Main date of the document, exactly as printed (do not reformat). Keywords: 'Invoice Date', 'Bill Date', 'Order Date', 'Payment Date', 'Estimate Date', 'Dated'"),
 
  due_date: z
    .string()
    .nullable()
    .describe("Payment due date if present, exactly as printed. Keywords: 'Due Date', 'DueDate', 'Payment Due'"),
 
  expiry_date: z
    .string()
    .nullable()
    .describe("Expiry/validity date, mainly for quotations. Keywords: 'Expiry Date', 'Valid Until'"),
 
  currency: z
    .enum(["INR", "USD", "EUR", "GBP", "AED", "OTHER"])
    .nullable()
    .describe("Primary currency of the document. Infer from symbols (₹/Rs.=INR, $=USD, €=EUR) or currency codes shown. Use OTHER for anything not listed and put the real code in currency_raw"),
 
  currency_raw: z
    .string()
    .nullable()
    .describe("The actual currency code/symbol as printed (e.g. 'SGD', 'AUD', '¥'). Fill this ESPECIALLY when currency = OTHER so the real value isn't lost"),
 
  exchange_rate: z
    .number()
    .nullable()
    .describe("Exchange rate to base/home currency, if the document shows one. Keywords: 'Exchange Rate', 'Ex. Rate', 'Conversion Rate'"),
 
  subject: z.string().nullable().describe("Subject or description line if present. Keywords: 'Subject'"),
 
  payment_terms: z.string().nullable().describe("Payment terms only. Keywords: 'Terms', 'Payment Terms', e.g. 'Net 30'"),
 
  delivery_terms: z
    .string()
    .nullable()
    .describe("Delivery / dispatch terms, kept separate from payment_terms. Keywords: 'Delivery Terms', 'Incoterms', 'Dispatch Through', 'Mode of Transport'"),
 
  // ---- GST / statutory (India) ----
  place_of_supply: z
    .string()
    .nullable()
    .describe("Keywords: 'Place of Supply', 'POS' — usually a state name/code on GST invoices"),
 
  reverse_charge: z
    .boolean()
    .nullable()
    .describe("Whether tax is under reverse charge. Keywords: 'Reverse Charge' (Yes/No). true=Yes, false=No"),
 
  einvoice: z
    .object({
      irn: z.string().nullable().describe("Invoice Reference Number. Keywords: 'IRN'"),
      ack_no: z.string().nullable().describe("Keywords: 'Ack No', 'Acknowledgement Number'"),
      ack_date: z.string().nullable().describe("As printed. Keywords: 'Ack Date', 'Acknowledgement Date'"),
    })
    .nullable()
    .describe("E-invoice details, if present (common on Indian B2B invoices). null if none"),
 
  issuing_company: z.object({
    name: z.string().nullable().describe("The company that created/issued this document — usually the letterhead at the top"),
    address: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    country: z.string().nullable(),
    pincode: z.string().nullable(),
    tax_id: z.string().nullable().describe("Keywords: 'GSTIN', 'TRN', 'VAT No', 'Tax ID', 'PAN'"),
    company_id: z.string().nullable().describe("Keywords: 'Company ID', 'CIN', 'Registration No'"),
    phone: z.array(z.string()).default([]),
    email: z.array(z.string()).default([]),
  }),
 
  counterparty: z
    .object({
      role: z
        .enum(["buyer", "seller", "vendor", "customer", "payee", "biller", "unknown"])
        .nullable()
        .describe("Relationship of this party to the issuing company. 'Bill To'/'Buyer'=buyer/customer, 'Bill From'/'Vendor Address'=vendor, 'Paid To'=payee"),
      name: z.string().nullable().describe("Keywords: 'Bill To', 'Bill From', 'Vendor Address', 'Paid To', 'Buyer', 'Consignee', 'Customer'"),
      address: z.string().nullable(),
      city: z.string().nullable(),
      state: z.string().nullable(),
      country: z.string().nullable(),
      pincode: z.string().nullable(),
      tax_id: z.string().nullable(),
      phone: z.array(z.string()).default([]),
      email: z.array(z.string()).default([]),
    })
    .nullable(),
 
  additional_parties: z
    .array(
      z.object({
        role: z.string().nullable().describe("e.g. 'ship_to', 'consignee', 'authorized_signatory'"),
        name: z.string().nullable(),
        address: z.string().nullable(),
      })
    )
    .default([])
    .describe("Any extra named parties beyond issuing_company and counterparty, e.g. a separate shipping address"),
 
  // ---- Beneficiary bank details (where the customer should PAY) ----
  bank_details: z
    .object({
      account_name: z.string().nullable().describe("Account holder name. Keywords: 'A/C Name', 'Beneficiary Name'"),
      bank_name: z.string().nullable().describe("Keywords: 'Bank', 'Bank Name'"),
      account_number: z.string().nullable().describe("Keywords: 'A/C No', 'Account Number'"),
      ifsc: z.string().nullable().describe("Keywords: 'IFSC', 'IFSC Code'"),
      swift: z.string().nullable().describe("Keywords: 'SWIFT', 'SWIFT/BIC'"),
      branch: z.string().nullable().describe("Keywords: 'Branch'"),
      upi: z.string().nullable().describe("Keywords: 'UPI', 'UPI ID', 'VPA'"),
    })
    .nullable()
    .describe("Beneficiary bank details printed for payment. Distinct from payment_info (which is how an already-made payment went out). null if none"),
 
  items: z
    .array(
      z.object({
        sl_no: z.number().nullable(),
        description: z.string().nullable().describe("Keywords: 'Item & Description', 'Description of Goods', 'Particulars'"),
        hsn_sac: z.string().nullable(),
        quantity: z.number().nullable().describe("Keywords: 'Qty', 'Quantity'"),
        unit: z.string().nullable(),
        rate: z.number().nullable().describe("Keywords: 'Rate', 'Unit Price'"),
 
        discount_percent: z.number().nullable().describe("Line-level discount %. Keywords: 'Disc %', 'Discount'"),
        discount_amount: z.number().nullable().describe("Line-level discount value"),
 
        // Overall line tax (use when not split into CGST/SGST/IGST)
        tax_percent: z.number().nullable().describe("Keywords: 'Tax %'"),
        tax_amount: z.number().nullable().describe("Keywords: 'Tax'"),
 
        // Optional per-line GST split (fill only if the line shows them separately)
        cgst_rate: z.number().nullable(),
        cgst_amount: z.number().nullable(),
        sgst_rate: z.number().nullable(),
        sgst_amount: z.number().nullable(),
        igst_rate: z.number().nullable(),
        igst_amount: z.number().nullable(),
 
        amount: z.number().nullable().describe("Keywords: 'Amount'"),
      })
    )
    .default([]),
 
  totals: z.object({
    subtotal: z.number().nullable().describe("Keywords: 'Sub Total', 'Total Taxable Amount'"),
    total_discount: z.number().nullable().describe("Document-level total discount. Keywords: 'Discount', 'Total Discount'"),
    tax_total: z.number().nullable().describe("Sum of all tax amounts, if shown separately"),
    shipping_charges: z.number().nullable().describe("Keywords: 'Shipping', 'Freight', 'Delivery Charges'"),
    round_off: z.number().nullable().describe("Keywords: 'Round Off', 'Rounding'. Can be negative"),
    adjustment: z.number().nullable().describe("Keywords: 'Adjustment'. Can be negative"),
    grand_total: z.number().nullable().describe("Keywords: 'Total', 'Grand Total', 'Amount Due'"),
    balance_due: z.number().nullable().describe("Keywords: 'Balance Due'"),
    amount_paid: z.number().nullable().describe("Keywords: 'Amount Paid', 'Payment Amount'"),
    amount_in_words: z.string().nullable(),
  }),
 
  taxes: z
    .array(
      z.object({
        tax_type: z.string().nullable().describe("Keywords: 'CGST', 'SGST', 'IGST', 'VAT', 'Zero Rate'"),
        rate_percent: z.number().nullable(),
        taxable_amount: z.number().nullable(),
        amount: z.number().nullable(),
        currency: z.string().nullable().describe("Currency this tax line is in, if different from the main document currency (e.g. an AED tax summary on a USD document)"),
      })
    )
    .default([]),
 
  payment_info: z
    .object({
      payment_mode: z.string().nullable().describe("Keywords: 'Payment Mode', e.g. Cash, Bank Transfer"),
      paid_through: z.string().nullable().describe("Keywords: 'Paid Through', bank/account name"),
      expense_account: z.string().nullable().describe("Keywords: 'Expense Account'"),
    })
    .nullable()
    .describe("Only relevant for payment/expense documents; null otherwise"),
 
  linked_documents: z
    .array(
      z.object({
        type: z.string().nullable().describe("e.g. 'bill', 'sales_order', 'purchase_order', 'quotation', 'po_reference'"),
        number: z.string().nullable(),
        date: z.string().nullable(),
        amount: z.number().nullable(),
      })
    )
    .default([])
    .describe("Any cross-referenced document numbers found — SO Number on a Bill, Ref# on a PO, the bill this payment was applied to, etc"),
 
  notes: z.string().nullable().describe("Short notes section, if present"),
  terms_and_conditions: z.string().nullable().describe("Long terms & conditions text block, if present"),
 
  // Object (not a string) so it maps cleanly to Prisma Json?
  additional_data: z
     .string()
    .nullable()
    .describe("Any other relevant fields found that don't fit the schema above, as a flat key-value object (no nested objects). Return null if nothing extra."),
      confidence_score: z.number().min(0).max(100).nullable()
    .describe("Your honest confidence (0-100) that this extraction is accurate. Lower this significantly if the document was blurry, handwritten, had unusual formatting, or if you had to guess any values."),
});
const multiDocumentSchema = z.object({
  documents: z.array(universalDocumentSchema)
    .describe("One entry PER distinct document found. If the email/attachments contain multiple separate invoices, POs, or bills, return one object for EACH. Do not merge different documents together."),
});
const agent1 = createAgent({
  model: llm,
  tools: [],
  responseFormat: toolStrategy(multiDocumentSchema, {
    handleError: (error: any) => {
      if (error?.issues) {
        console.error("❌ ZOD VALIDATION FAILED:");
        console.error(JSON.stringify(error.issues, null, 2));
      } else if (error?.name === "ZodError") {
        console.error("❌ ZOD ERROR:", error.errors);
      } else {
        console.error("❌ extracter error:", error?.message);
        console.error("error name:", error?.name);
      }
      return "Return a valid Extract JSON object";
    }
  })

})



const processAttachments = async (attachments: any[]): Promise<any[]> => {
  const blocks: any[] = [];

  for (const att of attachments ?? []) {
    // Gmail base64url → normal base64
    const b64 = att.data

    const mime = (att.mimeType || "").toLowerCase();
    const name = (att.filename || "").toLowerCase();

    try {
      // 1) PDF → native document block
      if (mime === "application/pdf" || name.endsWith(".pdf")) {
        blocks.push({
          type: "file",
          source_type: "base64",
          mime_type: "application/pdf",
          data: b64,
        });
      }

      // 2) Image → native image block
      else if (mime.startsWith("image/")) {
        blocks.push({
          type: "image",
          source_type: "base64",
          mime_type: att.mimeType,
          data: b64,
        });
      }

      // 3) DOCX → text extract (mammoth)
      else if (
        mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        name.endsWith(".docx")
      ) {
        const buf = Buffer.from(b64, "base64");
        const { value } = await mammoth.extractRawText({ buffer: buf });
        blocks.push({
          type: "text",
          text: `--- Attachment: ${att.filename} (Word document) ---\n${value}`,
        });
      }

      // 4) XLSX / XLS / CSV → text extract (SheetJS)
      else if (
        mime.includes("spreadsheet") ||
        mime === "application/vnd.ms-excel" ||
        mime === "text/csv" ||
        name.endsWith(".xlsx") ||
        name.endsWith(".xls") ||
        name.endsWith(".csv")
      ) {
        const buf = Buffer.from(b64, "base64");
        const wb = XLSX.read(buf, { type: "buffer" });
        let sheetText = "";
        for (const sheetName of wb.SheetNames) {
          sheetText += `\n[Sheet: ${sheetName}]\n`;
          sheetText += XLSX.utils.sheet_to_csv(wb?.Sheets?.[sheetName]!);
        }
        blocks.push({
          type: "text",
          text: `--- Attachment: ${att.filename} (Spreadsheet) ---\n${sheetText}`,
        });
      }

      // 5) Plain text / json
      else if (
        mime.startsWith("text/") ||
        name.endsWith(".txt") ||
        name.endsWith(".json")
      ) {
        const text = Buffer.from(b64, "base64").toString("utf-8");
        blocks.push({
          type: "text",
          text: `--- Attachment: ${att.filename} ---\n${text}`,
        });
      }

      // 6) Unsupported (jaise purana .doc) → skip, par LLM ko bata do file thi
      else {
        blocks.push({
          type: "text",
          text: `--- Attachment present but not readable: ${att.filename} (${mime}) ---`,
        });
        console.warn(`⚠️ Unsupported attachment skipped: ${att.filename} (${mime})`);
      }
    } catch (err: any) {
      console.error(`❌ Attachment process failed: ${att.filename}`, err?.message);
    }
  }

  return blocks;
};
const extractionPrompt = `
### ROLE
You extract structured data from business documents — invoices, bills, POs, sales orders,
quotations, payments, expenses, receipts — from any platform (Zoho, Tally, QuickBooks, SAP,
or manually typed).

### TWO INPUT TYPES
A) FORMAL DOCUMENTS (invoice/PO/bill/quotation): have letterhead, doc number, issue date.
   - issuing_company = entity that created & sent the document (letterhead/logo, top of page)
   - counterparty = the other named party (Bill To / Ship To / Vendor)
B) INQUIRY EMAILS (RFQ/price inquiry/order request): someone is ASKING, no formal doc attached,
   the email body IS the content.
   - issuing_company = null
   - counterparty = the sender. role = 'customer' (wants to buy/get quote),
     'vendor' (offering to sell), or 'buyer' (formal purchase intent).

### WHERE TO LOOK
PDF/image attachment is usually the primary source; some documents are typed directly in the
email body with no attachment. Extract from whichever holds the real data; if both have relevant
info, combine them.

### MULTIPLE DOCUMENTS
An email may contain several separate documents (e.g. 3 different invoices as 3 PDFs,
or an invoice + its related PO). Return ONE object in the "documents" array for EACH
distinct document. Never merge fields from different documents into one. If there is
only one document, return an array with a single object.

### FIELD MAPPING
Platforms use different labels for the same concept — match by MEANING, not exact wording.
E.g. "Grand Total", "Amount Due", "Balance Due", "Total" map to totals depending on context.

### RULES
- Field not present → null. Never guess or invent.
- Dates → keep exactly as printed (e.g. "16 Jul 2026", "25-May-26"). Don't reformat.
- Numbers → plain, no currency symbols or commas (25370, not "₹25,370.00").
- counterparty role: "Bill To" on the letterhead company's doc → counterparty is customer/buyer;
  "Bill From"/"Vendor Address" → counterparty is vendor.
- Extra named party (separate shipping address etc.) → additional_parties.
- Cross-referenced doc numbers (SO Number, PO Ref#, bill a payment applies against) → linked_documents.
- Any field with no home in the schema → additional_data as a FLAT JSON string
  (e.g. '{"delivery_note":"...","transporter":"..."}'). No nested objects.

### EXAMPLES
Inquiry: "Please send quotation for 200 units of product X, validity 1 month"
→ { "document_type":"quotation", "issuing_company":null,
    "counterparty":{"name":"sender name","role":"customer","email":["sender@example.com"]},
    "items":[{"description":"product X","quantity":200}],
    "expiry_date":"1 month", "notes":"Request for pricing on 200 units" }

Formal: PDF with Acme Corp letterhead, invoice #INV-001, billed to XYZ Ltd
→ { "document_type":"invoice", "issuing_company":{"name":"Acme Corp"},
    "counterparty":{"name":"XYZ Ltd","role":"customer"}, "document_number":"INV-001" }
`;
export const extracter = async (mail: any) => {
  try {
    const content: any[] = [
      {
        type: "text",
        text: `Extract the invoice details from this email.

From: ${mail.from}
Subject: ${mail.subject}

Body:
${mail.body}

`,
      },
    ];

    // console.log("here is the mail", mail)

    const attachmentBlocks = await processAttachments(mail.attachments);
    content.push(...attachmentBlocks);


    if (content.length === 1 && !mail.body) {
      console.warn(" No usable content to extract:", mail.messageId);
      return null;
    }

    const result = await agent1.invoke({
      messages: [
        { role: "system", content: extractionPrompt },
        new HumanMessage({ content })
      ]
    })
    const extractedData = result.structuredResponse ?? null;
    if (!extractedData) return null;
    if (!extractedData?.documents || extractedData.documents.length === 0) {
      console.warn('No documents extracted');
      return null;
    }

    const documentDetails = extractedData.documents.map(doc => ({
      document_type: doc.document_type,
      completeness: calculateCompleteness(doc),
      confidence: doc.confidence_score
    }));
    const tokenUsage = extractTokenUsage(result);
    return {
      data: extractedData,
      _meta: {
        token_usage: tokenUsage,
        documentDetails,
        extracted_at: new Date(),
      }
    }
  } catch (error: any) {
    try {
      const stream = error?.response?.body;
      if (stream) {
        let raw = "";
        for await (const chunk of stream) raw += chunk.toString();
        console.error(" GEMINI REASON:", raw);
      } else {
        console.error(" no stream, message:", error?.message);
      }
    } catch (e) {
      console.error("stream read fail:", e);
    }

    return null;
  }
}