import NextAuth from "next-auth";
import { options } from "@/auth";

const handler = NextAuth({
  ...options,
  debug: false,
  logger: {
    error(code: any, metadata: any) {
      console.error(code, metadata);
    },
    warn(code: any) {
      console.warn(code);
    },
    debug(code: any, metadata: any) {
      if (code.includes('session-token')) return;
      console.log(code, metadata);
    }
  }
});

export { handler as GET, handler as POST };