import db from "@/server/db";
import { donationApplications, users } from "@/server/db/schema";
import { getUserIdFromSession, getUserTypeFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return sendResponse(401, null, 'Unauthorized');
    }

    const getUserType = await getUserTypeFromSession();
    const isInvestor = getUserType === "investor";
    
    if (!isInvestor) {
      return sendResponse(403, null, 'Forbidden: Admin access required');
    }

    // Fetch all applications with user details
    const applications = await db
      .select({
        id: donationApplications.id,
        userId: donationApplications.userId,
        applicantName: users.fullName,
        applicantEmail: donationApplications.email,
        projectTitle: donationApplications.projectTitle,
        organization: donationApplications.organization,
        projectDescription: donationApplications.projectDescription,
        projectGoals: donationApplications.projectGoals,
        budgetAmount: donationApplications.budgetAmount,
        duration: donationApplications.duration,
        expectedImpact: donationApplications.expectedImpact,
        certificates: donationApplications.certificates,
        status: donationApplications.status,
        reviewNotes: donationApplications.reviewNotes,
        reviewedBy: donationApplications.reviewedBy,
        reviewedAt: donationApplications.reviewedAt,
        createdAt: donationApplications.createdAt,
        updatedAt: donationApplications.updatedAt,
      })
      .from(donationApplications)
      .leftJoin(users, eq(donationApplications.userId, users.id))
      .orderBy(donationApplications.createdAt);

    return sendResponse(200, applications, 'Applications fetched successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return sendResponse(500, null, errorMessage);
  }
}