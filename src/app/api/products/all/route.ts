import db from "@/server/db";
import { products } from "@/server/db/schema";
import { sendResponse } from "@/utils/response";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
      const allProducts = await db.select().from(products);
      return sendResponse(200, allProducts, "Products retrieved successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      return sendResponse(500, null, errorMessage);
    }
}