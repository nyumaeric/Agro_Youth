import db from "@/server/db";
import { roles, users } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import jwt , {JwtPayload, SignOptions} from "jsonwebtoken";
import { NextRequest } from "next/server";

const secret = process.env.JWT_SECRET as string;

export interface TokenPayload {
    id?: string;
    email?: string;
  }
interface DecodedToken extends JwtPayload {
  id: string;
}
  
  export const signToken = (payload: TokenPayload, expiresIn: string = '15h'): string => {
    const options: SignOptions = {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    };
    
    const token = jwt.sign(payload, secret, options);
    return token;
  }


  export async function verifySuperAdmin(req: NextRequest) {
    const token = req.cookies.get('auth-token')?.value || req.cookies.get('auth-token')?.value;
    
    if (!token) {
      return { isValid: false, error: "Authentication token required" };
    }
  
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return { isValid: false, error: "Server configuration error" };
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
      
      const adminUser = await db.select({
        id: users.id,
        email: users.fullName,
        roleName: roles.name
      }).from(users)
        .innerJoin(roles, eq(users.role, roles.id))
        .where(and(
          eq(users.id, decoded.id),
        //   eq(users.isActive, true)
        ))
        .limit(1);
  
      if (adminUser.length === 0 || adminUser[0].roleName !== "SuperAdmin") {
        return { isValid: false, error: "Unauthorized" };
      }
  
      return { isValid: true, adminData: adminUser[0] };
    } catch (err) {
      return { isValid: false, error: err };
    }
  }


  export const verifyToken = (token: string): { valid: boolean; expired: boolean; decoded?: TokenPayload } => {
    try {
      const decoded = jwt.verify(token, secret) as TokenPayload;
      return { valid: true, expired: false, decoded };
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        return { valid: false, expired: true };
      } else {
        return { valid: false, expired: false };
      }
    }
  };

export const isAuthenticated = async (req: NextRequest) => {
  const token = req.cookies.get('auth-token')?.value || req.cookies.get('auth-token')?.value;
  if (!token) {
    return {  error: "Authentication token required" };
  }
  const decoded = jwt.verify(token, secret) as TokenPayload;
  if (!decoded) {
    return { error: "Invalid token" };
  }
  return true;

}


