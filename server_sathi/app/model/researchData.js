import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
export const createResearch = async (research) => {
    try {
        return await prisma.researchData.create({
            data: {
                messageId: research.messageId ?? null,
                operation: research.operation,
                model: research.model ?? null,
                inputTokens: research.tokenUsage?.input_tokens ?? null,
                outputTokens: research.tokenUsage?.output_tokens ?? null,
                totalTokens: research.tokenUsage?.total_tokens ?? null,
                extractedAt: research.extractedAt ?? null,
                researchDataChild: {
                    create: (research.children ?? []).map((c) => ({
                        documentType: c.documentType ?? null,
                        confidenceScore: c.confidence != null ? new Prisma.Decimal(c.confidence) : null,
                        completenessPercent: c.completeness != null ? new Prisma.Decimal(c.completeness) : null,
                    })),
                },
            },
            include: { researchDataChild: true },
        });
    }
    catch (error) {
        console.error("createResearch error:", error);
        return null;
    }
};
//# sourceMappingURL=researchData.js.map