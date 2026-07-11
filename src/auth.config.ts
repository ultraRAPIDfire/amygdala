import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      return isDashboard ? isLoggedIn : true;
    },
  },
};
