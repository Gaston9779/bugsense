import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GitlabProvider from "next-auth/providers/gitlab";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
    GitlabProvider({
      clientId: process.env.GITLAB_ID!,
      clientSecret: process.env.GITLAB_SECRET!,
      authorization: {
        params: {
          scope: "read_user read_api read_repository",
        },
      },
    }),
    // Bitbucket OAuth2
    {
      id: "bitbucket",
      name: "Bitbucket",
      type: "oauth",
      authorization: {
        url: "https://bitbucket.org/site/oauth2/authorize",
        params: { scope: "account repository" },
      },
      token: "https://bitbucket.org/site/oauth2/access_token",
      userinfo: "https://api.bitbucket.org/2.0/user",
      clientId: process.env.BITBUCKET_ID!,
      clientSecret: process.env.BITBUCKET_SECRET!,
      profile(profile) {
        return {
          id: profile.uuid,
          name: profile.display_name,
          email: profile.email,
          image: profile.links?.avatar?.href,
        };
      },
    },
    // Azure DevOps OAuth2
    {
      id: "azure-devops",
      name: "Azure DevOps",
      type: "oauth",
      authorization: {
        url: "https://app.vssps.visualstudio.com/oauth2/authorize",
        params: { scope: "vso.code vso.identity vso.project" },
      },
      token: "https://app.vssps.visualstudio.com/oauth2/token",
      userinfo: "https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=6.0",
      clientId: process.env.AZURE_DEVOPS_ID!,
      clientSecret: process.env.AZURE_DEVOPS_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.displayName,
          email: profile.emailAddress,
          image: profile.coreAttributes?.Avatar?.value?.value,
        };
      },
    },
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async signIn(e) {
      console.log("[NextAuth] signIn", e.user?.email, e.account?.provider);
    },
    async signOut(e) {
      console.log("[NextAuth] signOut", e.session);
    },
    async linkAccount(e) {
      console.log("[NextAuth] linkAccount", e.account?.provider);
    },
  },
  logger: {
    error(code, metadata) {
      console.error("[NextAuth][error]", code, metadata);
    },
    warn(code) {
      console.warn("[NextAuth][warn]", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("[NextAuth][debug]", code, metadata);
      }
    },
  },
  pages: {
    // Use default NextAuth sign-in page to ensure provider redirect works
    error: "/auth/error", // Redirect to custom error page
  },
  session: {
    strategy: "database",
  },
  debug: process.env.NODE_ENV === "development",
};
