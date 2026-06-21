import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      tenantId: process.env.MICROSOFT_TENANT_ID || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { phoneNumber: credentials.identifier },
            ],
          },
        });

        if (!user || !user.passwordHash) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) return null;

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }
      if (user) {
        token.id = user.id;
        
        const adminEmails = [
          "roseymay209@gmail.com",
          "ebuber009@gmail.com",
          "ebuka@bernmx.onmicrosoft.com"
        ].map(e => e.toLowerCase());

        let role = (user as any).role || "VISITOR";
        
        if (user.email && adminEmails.includes(user.email.toLowerCase())) {
          role = "ADMIN";
          // Enforce ADMIN role in DB
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" }
          });
        }

        // Auto-create ResidentProfile if it doesn't exist so they can use the app immediately
        const existingProfile = await prisma.residentProfile.findUnique({
          where: { userId: user.id }
        });
        
        if (!existingProfile) {
           await prisma.residentProfile.create({
             data: {
               userId: user.id,
               uniqueId: `RES-${Math.floor(1000 + Math.random() * 9000)}X`,
             }
           });
        }

        token.role = role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
