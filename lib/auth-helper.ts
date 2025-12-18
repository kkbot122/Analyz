// lib/auth-helper.ts
import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const auth = NextAuth(authOptions).auth;

export { auth };