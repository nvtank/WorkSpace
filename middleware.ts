import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/calendar/:path*",
    "/finance/:path*",
    "/fitness/:path*",
    "/notes/:path*",
    "/gpa/:path*",
    "/settings/:path*",
    "/login",
  ],
};
