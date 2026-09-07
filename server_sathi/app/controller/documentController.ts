import { getDocumentById, getDocumentByUserId } from "../model/document.js";
import ExcelJS from "exceljs";

// controller mein dono controllers

// LIST controller
export const getUserDocumentController = async (req: any, res: any) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        message: "User not Authorized",
        success: false,
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const filters = {
      ...(req.query.startDate && { startDate: req.query.startDate }),
      ...(req.query.endDate && { endDate: req.query.endDate }),
      ...(req.query.documentNumber && { documentNumber: req.query.documentNumber }),
      ...(req.query.documentType && { documentType: req.query.documentType }),
    };

    const { docRows, total } = await getDocumentByUserId(req.user.id, page, limit, filters);

    return res.status(200).json({
      message: "Document data fetched successfully!",
      success: true,
      data: docRows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in document data fetching!",
      success: false,
      error: error instanceof Error ? error.message : error,
    });
  }
};

// 👇 SINGLE document controller (YE BHI MISSING THA)
export const getDocumentByIdController = async (req: any, res: any) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        message: "User not Authorized",
        success: false,
      });
    }

    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        message: "Document ID is required",
        success: false,
      });
    }

    const document = await getDocumentById(documentId, req.user.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Document fetched successfully!",
      success: true,
      data: document,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching document!",
      success: false,
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const downloadDocumentsExcel = async (req: any, res: any) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not Authorized", success: false });
    }

    const filters = {
      ...(req.query.startDate && { startDate: req.query.startDate }),
      ...(req.query.endDate && { endDate: req.query.endDate }),
      ...(req.query.documentNumber && { documentNumber: req.query.documentNumber }),
      ...(req.query.documentType && { documentType: req.query.documentType }),
    };

    // Saare filtered documents fetch karo (no pagination — full export)
    const { docRows } = await getDocumentByUserId(req.user.id, 1, 10000, filters);
    console.log("here is the user", req.user?.id, docRows)

    if (!docRows || docRows.length === 0) {
      return res.status(404).json({ message: "No documents found to export", success: false });
    }

    // ─── Workbook create karo ───
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "BizTrail";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Documents", {
      views: [{ state: "frozen", ySplit: 1 }], // header row freeze
    });

    // ─── Columns define karo ───
    sheet.columns = [
      { header: "S.No", key: "sno", width: 8 },
      { header: "Document Type", key: "documentType", width: 18 },
      { header: "Document Number", key: "documentNumber", width: 22 },
      { header: "Document Date", key: "documentDate", width: 16 },
      { header: "Due Date", key: "dueDate", width: 16 },
      { header: "Subject", key: "subject", width: 35 },
      { header: "Currency", key: "currency", width: 10 },
      { header: "Subtotal", key: "subtotal", width: 15 },
      { header: "Tax Total", key: "taxTotal", width: 15 },
      { header: "Discount", key: "totalDiscount", width: 15 },
      { header: "Shipping", key: "shippingCharges", width: 15 },
      { header: "Grand Total", key: "grandTotal", width: 18 },
      { header: "Balance Due", key: "balanceDue", width: 15 },
      { header: "Amount Paid", key: "amountPaid", width: 15 },
      { header: "Payment Terms", key: "paymentTerms", width: 20 },
      { header: "Delivery Terms", key: "deliveryTerms", width: 20 },
      { header: "Place of Supply", key: "placeOfSupply", width: 18 },
      { header: "Payment Mode", key: "paymentMode", width: 15 },
      { header: "Notes", key: "notes", width: 30 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    // ─── Header row styling ───
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF7C5CFC" }, // primary violet color
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 30;

    // ─── Data rows fill karo ───
    docRows.forEach((doc: any, index: number) => {
      const row = sheet.addRow({
        sno: index + 1,
        documentType: doc.documentType || "—",
        documentNumber: doc.documentNumber || "—",
        documentDate: doc.documentDate
          ? new Date(doc.documentDate).toLocaleDateString("en-IN")
          : doc.documentDateRaw || "—",
        dueDate: doc.dueDate
          ? new Date(doc.dueDate).toLocaleDateString("en-IN")
          : doc.dueDateRaw || "—",
        subject: doc.subject || "—",
        currency: doc.currency || "INR",
        subtotal: doc.subtotal ? Number(doc.subtotal) : 0,
        taxTotal: doc.taxTotal ? Number(doc.taxTotal) : 0,
        totalDiscount: doc.totalDiscount ? Number(doc.totalDiscount) : 0,
        shippingCharges: doc.shippingCharges ? Number(doc.shippingCharges) : 0,
        grandTotal: doc.grandTotal ? Number(doc.grandTotal) : 0,
        balanceDue: doc.balanceDue ? Number(doc.balanceDue) : 0,
        amountPaid: doc.amountPaid ? Number(doc.amountPaid) : 0,
        paymentTerms: doc.paymentTerms || "—",
        deliveryTerms: doc.deliveryTerms || "—",
        placeOfSupply: doc.placeOfSupply || "—",
        paymentMode: doc.paymentMode || "—",
        notes: doc.notes || "—",
        createdAt: new Date(doc.createdAt).toLocaleDateString("en-IN"),
      });

      // Alternate row color
      if (index % 2 === 1) {
        row.eachCell((cell: any) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF5F3FF" }, // light violet
          };
        });
      }

      // Number columns ko currency format do
      ["subtotal", "taxTotal", "totalDiscount", "shippingCharges", "grandTotal", "balanceDue", "amountPaid"].forEach((key) => {
        const cell = row.getCell(key);
        if (typeof cell.value === "number") {
          cell.numFmt = "#,##0.00";
        }
      });
    });

    // ─── Border lagao sab cells par ───
    sheet.eachRow((row: any) => {
      row.eachCell((cell: any) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
      });
    });

    // ─── Response headers set karo ───
    const fileName = `documents_${new Date().toISOString().split("T")[0]}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // ─── Stream to response ───
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Excel download error:", error);
    return res.status(500).json({
      message: "Error generating Excel file",
      success: false,
      error: error instanceof Error ? error.message : error,
    });
  }
};