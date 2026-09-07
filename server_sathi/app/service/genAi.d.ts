export declare const checkVerdict: (mail: any) => Promise<{
    data: {
        isBusiness: boolean;
        type: "other_business";
        confidence_score: number;
    };
    _meta: {
        token_usage: {
            input_tokens: number;
            output_tokens: number;
            total_tokens: number;
        };
        completeness_percent: number;
        document_type: string;
        extracted_at: Date;
    };
} | {
    data: {
        isBusiness: boolean;
        type: "contract" | "invoice" | "lead" | "meeting" | "none" | "other_business" | "payment" | "purchase_order" | "quotation" | "sales_inquiry" | "shipping" | "support";
        confidence_score: number | null;
    };
    _meta: {
        token_usage: {
            input_tokens: any;
            output_tokens: any;
            total_tokens: any;
        };
        completeness_percent: number;
        document_type: "contract" | "invoice" | "lead" | "meeting" | "none" | "other_business" | "payment" | "purchase_order" | "quotation" | "sales_inquiry" | "shipping" | "support";
        extracted_at: Date;
    };
} | {
    data: {
        isBusiness: boolean;
        type: string;
        confidence_score: null;
    };
    _meta: {
        token_usage: {
            input_tokens?: never;
            output_tokens?: never;
            total_tokens?: never;
        };
        completeness_percent: number;
        document_type: string;
        extracted_at: Date;
    };
} | null>;
export declare const extracter: (mail: any) => Promise<{
    data: {
        documents: {
            document_type: "bill" | "credit_note" | "debit_note" | "expense" | "invoice" | "other" | "payment" | "purchase_order" | "quotation" | "receipt" | "sales_order" | null;
            document_number: string | null;
            document_date: string | null;
            due_date: string | null;
            expiry_date: string | null;
            currency: "AED" | "EUR" | "GBP" | "INR" | "OTHER" | "USD" | null;
            currency_raw: string | null;
            exchange_rate: number | null;
            subject: string | null;
            payment_terms: string | null;
            delivery_terms: string | null;
            place_of_supply: string | null;
            reverse_charge: boolean | null;
            einvoice: {
                irn: string | null;
                ack_no: string | null;
                ack_date: string | null;
            } | null;
            issuing_company: {
                name: string | null;
                address: string | null;
                city: string | null;
                state: string | null;
                country: string | null;
                pincode: string | null;
                tax_id: string | null;
                company_id: string | null;
                phone?: string[] | undefined;
                email?: string[] | undefined;
            };
            counterparty: {
                role: "biller" | "buyer" | "customer" | "payee" | "seller" | "unknown" | "vendor" | null;
                name: string | null;
                address: string | null;
                city: string | null;
                state: string | null;
                country: string | null;
                pincode: string | null;
                tax_id: string | null;
                phone?: string[] | undefined;
                email?: string[] | undefined;
            } | null;
            additional_parties?: {
                role: string | null;
                name: string | null;
                address: string | null;
            }[] | undefined;
            bank_details: {
                account_name: string | null;
                bank_name: string | null;
                account_number: string | null;
                ifsc: string | null;
                swift: string | null;
                branch: string | null;
                upi: string | null;
            } | null;
            items?: {
                sl_no: number | null;
                description: string | null;
                hsn_sac: string | null;
                quantity: number | null;
                unit: string | null;
                rate: number | null;
                discount_percent: number | null;
                discount_amount: number | null;
                tax_percent: number | null;
                tax_amount: number | null;
                cgst_rate: number | null;
                cgst_amount: number | null;
                sgst_rate: number | null;
                sgst_amount: number | null;
                igst_rate: number | null;
                igst_amount: number | null;
                amount: number | null;
            }[] | undefined;
            totals: {
                subtotal: number | null;
                total_discount: number | null;
                tax_total: number | null;
                shipping_charges: number | null;
                round_off: number | null;
                adjustment: number | null;
                grand_total: number | null;
                balance_due: number | null;
                amount_paid: number | null;
                amount_in_words: string | null;
            };
            taxes?: {
                tax_type: string | null;
                rate_percent: number | null;
                taxable_amount: number | null;
                amount: number | null;
                currency: string | null;
            }[] | undefined;
            payment_info: {
                payment_mode: string | null;
                paid_through: string | null;
                expense_account: string | null;
            } | null;
            linked_documents?: {
                type: string | null;
                number: string | null;
                date: string | null;
                amount: number | null;
            }[] | undefined;
            notes: string | null;
            terms_and_conditions: string | null;
            additional_data: string | null;
            confidence_score: number | null;
        }[];
    };
    _meta: {
        token_usage: {
            input_tokens: any;
            output_tokens: any;
            total_tokens: any;
        };
        documentDetails: {
            document_type: "bill" | "credit_note" | "debit_note" | "expense" | "invoice" | "other" | "payment" | "purchase_order" | "quotation" | "receipt" | "sales_order" | null;
            completeness: number;
            confidence: number | null;
        }[];
        extracted_at: Date;
    };
} | null>;
//# sourceMappingURL=genAi.d.ts.map