import { NextRequest } from "next/server";

export const getPaginationParams = (req: NextRequest) => {
    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
    const limit = Math.max(Number(url.searchParams.get("limit")) || 8, 1);
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}


export const getSafePage = (searchParams: URLSearchParams): number => {
    const rawPage = searchParams.get("page");
    const parsed = Number(rawPage);
    return !isNaN(parsed) && parsed > 0 ? parsed : 1;
}