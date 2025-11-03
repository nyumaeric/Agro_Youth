import db from "@/server/db";
import { liveSessions } from "@/server/db/schema";
import { getUserIdFromSession, getUserTypeFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { liveSessionsSchema } from "@/validator/liveSessionValidator";
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { eq } from "drizzle-orm";

export const getGoogleOAuthClient = (): OAuth2Client => {
  return new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID, 
    process.env.AUTH_GOOGLE_SECRET, 
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`
  );
};

export const getAdminCalendarClient = async () => {
  const oauth2Client = getGoogleOAuthClient();
  
  if (!process.env.ADMIN_GOOGLE_REFRESH_TOKEN) {
    throw new Error('Admin refresh token not configured');
  }
  
  oauth2Client.setCredentials({
    refresh_token: process.env.ADMIN_GOOGLE_REFRESH_TOKEN,
  });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
};

export const createGoogleMeetLink = async (
  title: string,
  description: string,
  scheduledAt: Date,
  durationMinutes: number
) => {
  try {
    const calendar = await getAdminCalendarClient();
    
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60000);
    
    const event = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: title,
        description: description,
        start: {
          dateTime: scheduledAt.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      }
    });
    
    const meetLink = event.data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === 'video'
    )?.uri;
    
    if (!meetLink) {
      throw new Error('Failed to create Google Meet link');
    }
    
    return meetLink;
  } catch (error) {
    throw new Error('Failed to create Google Meet link');
  }
};

export const POST = async (request: Request) => {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const userId = await getUserIdFromSession();
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const userType = await getUserTypeFromSession();
    if (userType !== "investor") {
      return sendResponse(403, null, "Forbidden: Access is allowed only for investors");
    }

    const data = liveSessionsSchema.safeParse(body);
    if (!data.success) {
      const errors = Object.fromEntries(
        Object.entries(data.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
      );
      return sendResponse(400, errors, "Validation failed");
    }

    const { title, description, scheduledAt, durationMinutes, isActive } = data.data;

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof durationMinutes !== "number"
    ) {
      return sendResponse(400, null, "Validation failed: Missing or invalid fields.");
    }

    const meetingLink = await createGoogleMeetLink(
      title,
      description,
      new Date(scheduledAt),
      durationMinutes
    );

    await db.insert(liveSessions).values({
      hostId: userId as string,
      title,
      description: description,
      scheduledAt: new Date(scheduledAt),
      durationMinutes,
      meetingLink,
      isActive: isActive ?? false
    });

    return sendResponse(201, { meetingLink }, "Live session created successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage); 
  }
};

export const GET = async (request: Request) => {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return sendResponse(401, null, "Unauthorized");
    }

    const sessions = await db.select().from(liveSessions).where(
      eq(liveSessions.hostId, userId)
    );

    const now = new Date();

    for (const session of sessions) {
      const scheduledDate = new Date(session.scheduledAt);
      const endTime = new Date(scheduledDate.getTime() + session.durationMinutes * 60000);
      
      if (endTime < now && session.isActive) {
        await db
          .update(liveSessions)
          .set({ 
            isActive: false,
            updatedAt: now 
          })
          .where(eq(liveSessions.id, session.id));
        
        session.isActive = false;
      }
    }

    return sendResponse(200, sessions, "Live sessions retrieved successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return sendResponse(500, null, errorMessage); 
  }
};