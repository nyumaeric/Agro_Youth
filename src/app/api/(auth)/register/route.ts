import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import db from "@/server/db/index";
import { users, roles, verificationTokens } from "@/server/db/schema";
import { signToken } from "@/utils/jwtToken";
import { validateRegisterData } from "@/validator/registrationValidator";
import { eq } from "drizzle-orm";
import { sendResponse } from "@/utils/response";



export async function POST(request: NextRequest) {
  try {
    const validatedBody = await validateRegisterData(request);
    if (validatedBody instanceof NextResponse) return validatedBody;
    
    const { fullName, phoneNumber, userType, password } = validatedBody;

    const existingUser = await db.select().from(users)
      .where(eq(users.phoneNumber, phoneNumber));

    if (existingUser.length > 0) {
      return sendResponse(400, null, "Phone Number already exists");
    }

    const userRole = await db.select({ id: roles.id, name: roles.name })
      .from(roles)
      .where(eq(roles.name, "User"))
      .limit(1);

    if (userRole.length === 0) {
      return sendResponse(500, null, "User role not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedUserType = userType ? userType.toLowerCase() : "buyer";
    const validUserType: "farmer" | "buyer" = 
      normalizedUserType === "farmer" ? "farmer" : "buyer";

    const insertUser = await db.insert(users).values({
      fullName,
      phoneNumber,
      password: hashedPassword,
      role: userRole[0].id,
      userType: validUserType 
    }).returning({
      id: users.id,
      phoneNumber: users.phoneNumber,
      fullName: users.fullName,
      role: users.role
    });

    if (insertUser.length === 0) {
      return sendResponse(500, null, "Failed to create user");
    }

    const newUser = insertUser[0];

    const token = signToken({
      phoneNumber: newUser.phoneNumber,
      id: newUser.id,
      role: newUser.role
    });

    await db.insert(verificationTokens).values({
      identifier: newUser.id,
      token: token,
      expires: new Date(Date.now() + 15 * 60 * 1000)
    });
    
    return sendResponse(200, null, "Successfully registered");

  } catch (error) {
    return sendResponse(500, null, error instanceof Error ? error.message : "Internal Server Error");
  }
}