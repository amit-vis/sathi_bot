import { getDocumentById, getDocumentByUserId } from "../model/document.js";

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