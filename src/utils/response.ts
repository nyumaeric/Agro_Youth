import { NextResponse } from "next/server"

export const sendResponse = <T>(status: number, data: T, message: string)=> {
    const result = /^20\d$/.test(status.toString()) ? "success" : "error"
    return NextResponse.json({
        status: result,
        message,
        data
    }, {
        status
    })
}