import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      organizations: {
        id: string;
        name: string;
        role: "ORG_OWNER" | "PROJECT_OWNER" | "TEAM_MEMBER";
        projects: {
          id: string;
          name: string;
          role: "OWNER" | "MEMBER";
        }[];
      }[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: Session["user"];
  }
}
