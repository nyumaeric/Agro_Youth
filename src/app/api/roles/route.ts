import db from "@/server/db";
import { roles } from "@/server/db/schema";
import { checkIfUserIsAdmin } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { roleSchema } from "@/validator/rolesValidator";
import { NextRequest } from "next/server";

export const POST = async(req: NextRequest) => {
    try {

        const [isAdmin] = await Promise.all([
            checkIfUserIsAdmin(),
          ]);

        const isAuthorized = isAdmin
        if (!isAuthorized) {
            return sendResponse(401, null, "Unauthorized");
        }
        let body: unknown;
        try {
        body = await req.json();
        } catch {
        body = {};
        }
        const data = roleSchema.safeParse(body);

        if(!data.success){
            const errors =  Object.fromEntries(
                Object.entries(data.error.flatten().fieldErrors).map(([k,v]) => [k,v ?? []])
            )
            return sendResponse(400, null, "Validation failed");
        }
        const { name, description} = await data.data;
        if (!name) {
            return sendResponse(400, null, "Please provide all fields");
        }
        await db.insert(roles).values({
            name,
            description
        })
        return sendResponse(200, null, "Role created successfully");
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        return sendResponse(500, null, errorMessage); 
    }
}

export const GET = async(req: NextRequest) => {
    void req;
    try {
        const allRoles = await db.select().from(roles);
        if(allRoles.length === 0){
            return sendResponse(404, null, "No roles found");
        }
        return sendResponse(200, allRoles, "Roles fetched successfully");
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        return sendResponse(500, null, errorMessage);
    }
}