import { Prisma } from "@prisma/client";
import {prisma} from "../config/db.js";
import {dec, parseDate} from "../config/helperfunction/documentHelper.js"

const mapParties = (doc: any): Prisma.DocumentPartyCreateManyDocumentInput[]=>{
    const rows : Prisma.DocumentPartyCreateManyDocumentInput[] = [];
    const ic = doc.issuing_company;
    rows.push({
        partyKind: "issuing_company",
        role: null,
        name: ic.name || null,
        address: ic.address || null,
        city: ic.city || null,
        state: ic.state || null,
        country: ic.country || null,
        pincode: ic.pincode || null,
        taxId: ic.tax_id || null,
        companyId: ic.company_id || null,
        phone: ic.phone ?? [],
        email: ic.email ?? [],
    });

    if(doc.counterparty){
        const cp = doc.counterparty;
        rows.push({
            partyKind: "counterparty",
            role: cp.role || null,
            name: cp.name || null,
            address: cp.address || null,
            city: cp.city || null,
            state: cp.state || null,
            country: cp.country || null,
            pincode: cp.pincode || null,
            taxId: cp.tax_id || null,
            companyId: null,
            phone: cp.phone ?? [],
            email: cp.email ?? [],
        })
    }

    for(const ap of doc.additional_parties ?? []){
        rows.push({
            partyKind: "additional",
            role: ap.role || null,
            name: ap.name || null,
            address: ap.address || null,
            city: null,
            state: null,
            country: null,
            pincode: null,
            taxId: null,
            companyId: null,
            phone: [],
            email: [],
        })
    }

    return rows;
}

function mapItems(doc: any): Prisma.DocumentItemCreateManyDocumentInput[] {
  return (doc.items ?? []).map((it: any, i: any) => ({
    lineNo: i + 1, // positional; Zod doesn't provide this
    slNo: it.sl_no,
    description: it.description,
    hsnSac: it.hsn_sac,
    quantity: dec(it.quantity),
    unit: it.unit,
    rate: dec(it.rate),
    discountPercent: dec(it.discount_percent),
    discountAmount: dec(it.discount_amount),
    taxPercent: dec(it.tax_percent),
    taxAmount: dec(it.tax_amount),
    cgstRate: dec(it.cgst_rate),
    cgstAmount: dec(it.cgst_amount),
    sgstRate: dec(it.sgst_rate),
    sgstAmount: dec(it.sgst_amount),
    igstRate: dec(it.igst_rate),
    igstAmount: dec(it.igst_amount),
    amount: dec(it.amount),
  }));
}

const mapTaxes = (doc: any): Prisma.DocumentPartyCreateManyDocumentInput[]=>{
    return (doc.taxes ?? []).map((t: any)=>({
        taxType: t.tax_type || null,
        ratePercent: dec(t.rate_percent) || null,
        taxableAmount: dec(t.taxable_amount) || null,
        amount: dec(t.amount) || null,
        currency: t.currency || null,
    }));
}

const mapLinked = (doc: any):Prisma.LinkedDocumentCreateManyDocumentInput[]=>{
    return (doc.linked_documents ?? []).map((l: any)=>({
        type: l.type || null,
        number: l.number || null,
        dateRaw: l.date || null,
        amount: dec(l.amount) || null,
    }))
}

function mapScalars(doc: any) {
  const t = doc.totals;
  const pay = doc.payment_info;
  const bank = doc.bank_details;
  const ei = doc.einvoice;

   let additionalData: Prisma.InputJsonValue | typeof Prisma.JsonNull = Prisma.JsonNull;
  if (doc.additional_data) {
    try {
      additionalData =
        typeof doc.additional_data === "string"
          ? JSON.parse(doc.additional_data)
          : doc.additional_data;
    } catch {
      additionalData = { raw: String(doc.additional_data) }; // parse fail ho toh raw store kar do
    }
  }
 
  return {
    documentType: doc.document_type ?? null,
    documentNumber: doc.document_number ?? null,
    messageId: doc.messageId,
 
    documentDateRaw: doc.document_date,
    documentDate: parseDate(doc.document_date),
    dueDateRaw: doc.due_date,
    dueDate: parseDate(doc.due_date),
    expiryDateRaw: doc.expiry_date,
    expiryDate: parseDate(doc.expiry_date),
 
    currency: doc.currency ?? null,
    currencyRaw: doc.currency_raw,
    exchangeRate: dec(doc.exchange_rate),
 
    subject: doc.subject,
    paymentTerms: doc.payment_terms,
    deliveryTerms: doc.delivery_terms,
 
    placeOfSupply: doc.place_of_supply,
    reverseCharge: doc.reverse_charge ?? null,
 
    irn: ei?.irn ?? null,
    ackNo: ei?.ack_no ?? null,
    ackDateRaw: ei?.ack_date ?? null,
 
    bankAccountName: bank?.account_name ?? null,
    bankName: bank?.bank_name ?? null,
    bankAccountNumber: bank?.account_number ?? null,
    bankIfsc: bank?.ifsc ?? null,
    bankSwift: bank?.swift ?? null,
    bankBranch: bank?.branch ?? null,
    bankUpi: bank?.upi ?? null,
 
    subtotal: dec(t.subtotal),
    totalDiscount: dec(t.total_discount),
    taxTotal: dec(t.tax_total),
    shippingCharges: dec(t.shipping_charges),
    roundOff: dec(t.round_off),
    adjustment: dec(t.adjustment),
    grandTotal: dec(t.grand_total),
    balanceDue: dec(t.balance_due),
    amountPaid: dec(t.amount_paid),
    amountInWords: t.amount_in_words,
 
    paymentMode: pay?.payment_mode ?? null,
    paidThrough: pay?.paid_through ?? null,
    expenseAccount: pay?.expense_account ?? null,
 
    notes: doc.notes,
    termsAndConditions: doc.terms_and_conditions,
    additionalData,
  };
}
 

export async function upsertDocument(userId: string, doc: any, messageId: any,docIndex: number) {
  const scalars = { ...mapScalars(doc), messageId, docIndex };
 
  const childrenCreate = {
    parties: { create: mapParties(doc) },
    items: { create: mapItems(doc) },
    taxes: { create: mapTaxes(doc) },
    linkedDocuments: { create: mapLinked(doc) },
  };
 
  // Children are replaced wholesale on update (delete old, create new).
  const childrenReplace = {
    parties: { deleteMany: {}, create: mapParties(doc) },
    items: { deleteMany: {}, create: mapItems(doc) },
    taxes: { deleteMany: {}, create: mapTaxes(doc) },
    linkedDocuments: { deleteMany: {}, create: mapLinked(doc) },
  };
 
  return prisma.document.upsert({
    where: {
      userId_messageId_docIndex: { userId, messageId, docIndex },   // 👈 naya key
    },
    create: { user: { connect: { id: userId } },
     ...scalars, ...childrenCreate },
    update: { ...scalars, ...childrenReplace },
    include: { parties: true, items: true, taxes: true, linkedDocuments: true },
  });
}

// model - sirf data return karo
// model/document.ts

// 👇 LIST - saare documents with filters
export const getDocumentByUserId = async (
  userId: string,
  page = 1,
  limit = 20,
  filters?: {
    startDate?: Date | string;
    endDate?: Date | string;
    documentNumber?: string;
    documentType?: string;
  }
) => {
  const skip = (page - 1) * limit;

  const where: Prisma.DocumentWhereInput = {
    userId,

    ...(filters?.startDate || filters?.endDate
      ? {
          createdAt: {
            ...(filters.startDate && { gte: new Date(filters.startDate) }),
            ...(filters.endDate && { lte: new Date(filters.endDate) }),
          },
        }
      : {}),

    ...(filters?.documentNumber && {
      documentNumber: {
        contains: filters.documentNumber,
        mode: "insensitive" as Prisma.QueryMode,
      },
    }),

    ...(filters?.documentType && {
      documentType: filters.documentType as any,
    }),
  };

  const [docRows, total] = await prisma.$transaction([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return { docRows, total };
};

// 👇 SINGLE - ek document with all relations (YE MISSING THA)
export const getDocumentById = async (documentId: string, userId: string) => {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId,
    },
    include: {
      parties: true,
      items: {
        orderBy: { lineNo: "asc" },
      },
      taxes: true,
      linkedDocuments: true,
    },
  });

  return document;
};