-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('invoice', 'bill', 'purchase_order', 'sales_order', 'quotation', 'payment', 'expense', 'receipt', 'credit_note', 'debit_note', 'other');

-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('INR', 'USD', 'EUR', 'GBP', 'AED', 'OTHER');

-- CreateEnum
CREATE TYPE "PartyKind" AS ENUM ('issuing_company', 'counterparty', 'additional');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "user_name" TEXT,
    "user_email" TEXT NOT NULL,
    "user_mobile_number" TEXT,
    "gmail_refresh_token" TEXT,
    "gmail_access_token" TEXT,
    "hotmail_refresh_token" TEXT,
    "hotmail_access_token" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "document_type" "DocumentType",
    "document_number" TEXT,
    "document_date_raw" TEXT,
    "document_date" DATE,
    "due_date_raw" TEXT,
    "due_date" DATE,
    "expiry_date_raw" TEXT,
    "expiry_date" DATE,
    "currency" "CurrencyCode",
    "subject" TEXT,
    "payment_terms" TEXT,
    "subtotal" DECIMAL(18,2),
    "tax_total" DECIMAL(18,2),
    "grand_total" DECIMAL(18,2),
    "balance_due" DECIMAL(18,2),
    "amount_paid" DECIMAL(18,2),
    "amount_in_words" TEXT,
    "payment_mode" TEXT,
    "paid_through" TEXT,
    "expense_account" TEXT,
    "notes" TEXT,
    "terms_and_conditions" TEXT,
    "additional_data" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_parties" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "party_kind" "PartyKind" NOT NULL,
    "role" TEXT,
    "name" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pincode" TEXT,
    "tax_id" TEXT,
    "company_id" TEXT,
    "phone" TEXT[],
    "email" TEXT[],

    CONSTRAINT "document_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_items" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "line_no" INTEGER,
    "sl_no" INTEGER,
    "description" TEXT,
    "hsn_sac" TEXT,
    "quantity" DECIMAL(18,4),
    "unit" TEXT,
    "rate" DECIMAL(18,4),
    "tax_percent" DECIMAL(6,2),
    "tax_amount" DECIMAL(18,2),
    "amount" DECIMAL(18,2),

    CONSTRAINT "document_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_taxes" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "tax_type" TEXT,
    "rate_percent" DECIMAL(6,2),
    "taxable_amount" DECIMAL(18,2),
    "amount" DECIMAL(18,2),
    "currency" TEXT,

    CONSTRAINT "document_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linked_documents" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "type" TEXT,
    "number" TEXT,
    "date_raw" TEXT,
    "amount" DECIMAL(18,2),

    CONSTRAINT "linked_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserachData" (
    "id" UUID NOT NULL,
    "confidence_score" DECIMAL(5,2),
    "completeness_percent" DECIMAL(5,2),
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "total_tokens" INTEGER,
    "extracted_at" TIMESTAMPTZ(6),

    CONSTRAINT "reserachData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_email_key" ON "users"("user_email");

-- CreateIndex
CREATE INDEX "documents_user_id_idx" ON "documents"("user_id");

-- CreateIndex
CREATE INDEX "documents_document_type_idx" ON "documents"("document_type");

-- CreateIndex
CREATE INDEX "documents_document_date_idx" ON "documents"("document_date");

-- CreateIndex
CREATE INDEX "documents_document_number_idx" ON "documents"("document_number");

-- CreateIndex
CREATE UNIQUE INDEX "documents_document_type_document_number_key" ON "documents"("document_type", "document_number");

-- CreateIndex
CREATE INDEX "document_parties_document_id_idx" ON "document_parties"("document_id");

-- CreateIndex
CREATE INDEX "document_parties_name_idx" ON "document_parties"("name");

-- CreateIndex
CREATE INDEX "document_items_document_id_idx" ON "document_items"("document_id");

-- CreateIndex
CREATE INDEX "document_taxes_document_id_idx" ON "document_taxes"("document_id");

-- CreateIndex
CREATE INDEX "linked_documents_document_id_idx" ON "linked_documents"("document_id");

-- CreateIndex
CREATE INDEX "linked_documents_number_idx" ON "linked_documents"("number");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_parties" ADD CONSTRAINT "document_parties_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_items" ADD CONSTRAINT "document_items_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_taxes" ADD CONSTRAINT "document_taxes_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linked_documents" ADD CONSTRAINT "linked_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
