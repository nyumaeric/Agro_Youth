import db from "@/server/db";
import { donationApplications } from "@/server/db/schema";
import { getUserIdFromSession, getUserTypeFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
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
  
      const { id } = await params;
      const body = await req.json();
      const { status, reviewNotes } = body;
  
      if (!status || !reviewNotes) {
        return sendResponse(400, null, 'Status and review notes are required');
      }
  
      if (!['approved', 'rejected'].includes(status)) {
        return sendResponse(400, null, 'Invalid status');
      }
  
      // Get the application to fetch applicant details
      const [application] = await db
        .select()
        .from(donationApplications)
        .where(eq(donationApplications.id, id));
  
      if (!application) {
        return sendResponse(404, null, 'Application not found');
      }
  
      // Update application
      const [updatedApplication] = await db
        .update(donationApplications)
        .set({
          status,
          reviewNotes,
          reviewedBy: userId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(donationApplications.id, id))
        .returning();
  
      // TODO: Send email notification to applicant
      // You can integrate with services like Resend, SendGrid, etc.
      // await sendEmailNotification({
      //   to: applicantEmail,
      //   subject: `Application ${status}`,
      //   body: reviewNotes,
      // });
  
      return sendResponse(200, updatedApplication, `Application ${status} successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      return sendResponse(500, null, errorMessage);
    }
  }