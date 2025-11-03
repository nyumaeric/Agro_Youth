import db from "@/server/db";
import { certificates, users, course } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const userCertificates = await db
      .select({
        certificateId: certificates.id,
        issuedAt: certificates.issuedAt,
        completionMessage: certificates.completionMessage,
        completedAt: certificates.completedAt,
        
        userId: users.id,
        userName: users.fullName,
        userEmail: users.phoneNumber,
        
        courseId: course.id,
        courseTitle: course.title,
        courseDescription: course.description,
        courseLevel: course.level,
        courseCategory: course.category,
        timeToComplete: course.timeToComplete,
        
        instructorId: course.createdId,
      })
      .from(certificates)
      .leftJoin(users, eq(users.id, certificates.userId))
      .leftJoin(course, eq(course.id, certificates.courseId))
      .where(eq(certificates.userId, userId));

    const certificatesWithInstructor = await Promise.all(
      userCertificates.map(async (cert) => {
        let instructorName = "Unknown Instructor";
        
        if (cert.instructorId) {
          const instructor = await db
            .select({
              name: users.fullName,
            })
            .from(users)
            .where(eq(users.id, cert.instructorId))
            .limit(1);
          
          if (instructor.length > 0 && instructor[0].name) {
            instructorName = instructor[0].name;
          }
        }

        return {
          id: cert.certificateId,
          userId: cert.userId,
          courseId: cert.courseId,
          issuedAt: cert.issuedAt,
          completionMessage: cert.completionMessage,
          completedAt: cert.completedAt,
          
          // User info
          userName: cert.userName,
          userEmail: cert.userEmail,
          
          // Course info
          courseTitle: cert.courseTitle,
          courseDescription: cert.courseDescription,
          courseLevel: cert.courseLevel,
          courseCategory: cert.courseCategory,
          timeToComplete: cert.timeToComplete,
          
          // Instructor info
          courseInstructorFullName: instructorName,
        };
      })
    );

    return sendResponse(200, certificatesWithInstructor, "Certificates fetched successfully");
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage);
  }
};