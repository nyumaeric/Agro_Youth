import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { sendResponse } from '@/utils/response';
import db from '@/server/db';
import { donationApplications } from '@/server/db/schema';
import { getUserIdFromSession } from '@/utils/getUserIdFromSession';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return sendResponse(401, null, 'Unauthorized');
    }

    const formData = await req.formData();
    
    const projectTitle = formData.get('projectTitle') as string;
    const organization = formData.get('organization') as string;
    const projectDescription = formData.get('projectDescription') as string;
    const projectGoals = formData.get('projectGoals') as string;
    const budgetAmount = formData.get('budgetAmount') as string;
    const duration = formData.get('duration') as string;
    const expectedImpact = formData.get('expectedImpact') as string;
    const email = formData.get('email') as string

    if (!projectTitle || !projectDescription || !projectGoals || !budgetAmount || !duration || !expectedImpact) {
      return sendResponse(400, null, 'Missing required fields');

    }

    const certificates = formData.getAll('certificates') as File[];
    const uploadedFiles: string[] = [];

    if (certificates.length === 0) {
      return sendResponse(400, null, 'At least one certificate is required');
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
    await mkdir(uploadDir, { recursive: true });

    for (const file of certificates) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`;
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      uploadedFiles.push(`/uploads/certificates/${filename}`);
    }

    const [application] = await db
      .insert(donationApplications)
      .values({
        userId,
        projectTitle,
        organization: organization || null,
        projectDescription,
        projectGoals,
        budgetAmount: parseInt(budgetAmount),
        duration,
        email,
        expectedImpact,
        certificates: uploadedFiles,
        status: 'pending',
      })
      .returning();

    return sendResponse(200, application, 'Application submitted successfully');
  } catch (error) {
    console.error('Error submitting application:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return sendResponse(500, null, errorMessage);
  }
}

export async function GET(req: NextRequest) {
    try {
      const userId = await getUserIdFromSession();
      
      if (!userId) {
        return sendResponse(401, null, 'Unauthorized');
      }
  
      const applications = await db
        .select()
        .from(donationApplications)
        .where(eq(donationApplications.userId, userId))
        .orderBy(donationApplications.createdAt);
  
      return sendResponse(200, applications, 'Applications fetched successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      return sendResponse(500, null, errorMessage);
    }
  }