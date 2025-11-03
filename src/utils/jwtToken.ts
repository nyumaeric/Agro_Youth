import jwt from "jsonwebtoken";

const secret = process.env.SECRET_KEY || 'kRkQ9Qq/2iwtkQqjRBIU6+Xd1Yi0RKnBVFOZCI9cfQwcxp03voGBMjsOt5tk+/f2fGoJh+DQEhGEOyg2nYaoWufjKbcElCFPnV+VIVBE'

export interface TokenPayload {
    id?:string;
    phoneNumber?: string;
    role?: string | null
}
export const verifyToken = async(token: string): Promise<TokenPayload | null> => {
    try{
        const decoded = jwt.verify(token, secret)
        return decoded as TokenPayload
    } catch (error) {
        return null
    }
}

export const signToken = (payload: TokenPayload, expiresIn: string = '2h'): string => {
    if (!secret) {
        throw new Error('JWT secret is not defined')
    }
    
    const token = jwt.sign(
        payload, 
        secret as jwt.Secret, 
        { 
            expiresIn: expiresIn as any
        }
    )
    return token
}