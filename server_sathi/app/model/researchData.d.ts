import { Prisma } from "@prisma/client";
interface ResearchInput {
    messageId?: string | null;
    operation: "verdict" | "extraction";
    model?: string | null;
    tokenUsage: {
        input_tokens?: number | null;
        output_tokens?: number | null;
        total_tokens?: number | null;
    };
    extractedAt?: Date | null;
    children?: Array<{
        documentType?: string | null;
        confidence?: number | null;
        completeness?: number | null;
    }>;
}
export declare const createResearch: (research: ResearchInput) => Promise<({
    researchDataChild: {
        id: string;
        documentType: string | null;
        confidenceScore: Prisma.Decimal | null;
        completenessPercent: Prisma.Decimal | null;
        researchId: string;
    }[];
} & {
    id: string;
    messageId: string | null;
    operation: string | null;
    model: string | null;
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
    extractedAt: Date | null;
    createdAt: Date;
}) | null>;
export {};
//# sourceMappingURL=researchData.d.ts.map