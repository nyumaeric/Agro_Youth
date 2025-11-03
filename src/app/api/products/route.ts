import db from "@/server/db";
import { products } from "@/server/db/schema";
import { getUserIdFromSession } from "@/utils/getUserIdFromSession";
import { sendResponse } from "@/utils/response";
import { createProductSchema } from "@/validator/productValidator";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


interface productsInterface {
    cropName: string;
    quantity: number;
    unit: string;
    price: number;
    description: string;
    location: string;
    isAvailable: boolean;
}
export const POST = async(req: NextRequest) => {
    try {
        let body: unknown;
        try {
          body = await req.json();
        } catch {
          body = {};
        }
        const userId = await getUserIdFromSession();
  
    
        if (!userId) {
          return sendResponse(401, null, "Unauthorized");
        }
 
       const data = createProductSchema.safeParse(body);
       if (!data.success) {
         const errors = Object.fromEntries(
           Object.entries(data.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
         );
         return NextResponse.json(
           { status: "Error!", errors, message: "Validation failed" }, 
           { status: 400 }
         );
       }

       const { cropName, quantity, unit, price, description, location, isAvailable } = data.data as unknown as productsInterface;
       if(!cropName || !quantity || !unit || !price || !description || !location){
        return sendResponse(400, null, "All fields are required");
       }
       
       await db.insert(products).values({
        userId,
        cropName,        
        quantity,
        unit,
        price,        
        description,
        location,
        isAvailable     
      })

       return sendResponse(201, null, "Product created successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      return sendResponse(500, null, errorMessage);
    }
}

export const GET = async (req: NextRequest) => {
    try {
      const userId = await getUserIdFromSession();
      if(!userId){
        return sendResponse(401, null, "Unauthorized");
      }
      const allProducts = await db.select().from(products).where(eq(products.userId, userId));
      return sendResponse(200, allProducts, "Products retrieved successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      return sendResponse(500, null, errorMessage);
    }
}