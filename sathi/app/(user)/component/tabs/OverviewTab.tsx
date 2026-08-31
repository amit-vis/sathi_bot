import InfoCard from "../shared/InfoCard";
import InfoRow from "../shared/InfoRow";
import { formatDate, formatCurrency } from "../helperfunction/helpers";

export default function OverviewTab({ doc }: { doc: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoCard title="Document Info">
        <InfoRow label="Document Number" value={doc.documentNumber} />
        <InfoRow label="Type" value={doc.documentType?.replace("_", " ")} />
        <InfoRow label="Subject" value={doc.subject} />
        <InfoRow label="Date" value={formatDate(doc.documentDate)} />
        <InfoRow label="Due Date" value={formatDate(doc.dueDate)} />
        <InfoRow label="Expiry Date" value={formatDate(doc.expiryDate)} />
        <InfoRow label="Place of Supply" value={doc.placeOfSupply} />
        <InfoRow label="Reverse Charge" value={doc.reverseCharge ? "Yes" : "No"} />
      </InfoCard>

      <InfoCard title="Financial Summary">
        <InfoRow label="Subtotal" value={formatCurrency(doc.subtotal)} />
        <InfoRow label="Discount" value={formatCurrency(doc.totalDiscount)} />
        <InfoRow label="Tax Total" value={formatCurrency(doc.taxTotal)} />
        <InfoRow label="Shipping" value={formatCurrency(doc.shippingCharges)} />
        <InfoRow label="Round Off" value={formatCurrency(doc.roundOff)} />
        <InfoRow label="Grand Total" value={formatCurrency(doc.grandTotal)} bold />
        <InfoRow label="Amount Paid" value={formatCurrency(doc.amountPaid)} />
        <InfoRow label="Balance Due" value={formatCurrency(doc.balanceDue)} bold />
        <InfoRow label="Amount in Words" value={doc.amountInWords} />
      </InfoCard>

      <InfoCard title="Payment Info">
        <InfoRow label="Currency" value={doc.currency || doc.currencyRaw} />
        <InfoRow label="Exchange Rate" value={doc.exchangeRate} />
        <InfoRow label="Payment Mode" value={doc.paymentMode} />
        <InfoRow label="Paid Through" value={doc.paidThrough} />
        <InfoRow label="Payment Terms" value={doc.paymentTerms} />
        <InfoRow label="Delivery Terms" value={doc.deliveryTerms} />
      </InfoCard>

      <InfoCard title="Bank Details">
        <InfoRow label="Account Name" value={doc.bankAccountName} />
        <InfoRow label="Bank Name" value={doc.bankName} />
        <InfoRow label="Account No" value={doc.bankAccountNumber} />
        <InfoRow label="IFSC" value={doc.bankIfsc} />
        <InfoRow label="SWIFT" value={doc.bankSwift} />
        <InfoRow label="Branch" value={doc.bankBranch} />
        <InfoRow label="UPI" value={doc.bankUpi} />
      </InfoCard>

      {(doc.irn || doc.ackNo) && (
        <InfoCard title="E-Invoice">
          <InfoRow label="IRN" value={doc.irn} />
          <InfoRow label="Ack No" value={doc.ackNo} />
          <InfoRow label="Ack Date" value={doc.ackDateRaw} />
        </InfoCard>
      )}

      {(doc.notes || doc.termsAndConditions) && (
        <InfoCard title="Notes & Terms">
          {doc.notes && (
            <div className="mb-3">
              <p className="text-xs text-muted mb-1">Notes</p>
              <p className="text-sm">{doc.notes}</p>
            </div>
          )}
          {doc.termsAndConditions && (
            <div>
              <p className="text-xs text-muted mb-1">Terms & Conditions</p>
              <p className="text-sm">{doc.termsAndConditions}</p>
            </div>
          )}
        </InfoCard>
      )}
    </div>
  );
}