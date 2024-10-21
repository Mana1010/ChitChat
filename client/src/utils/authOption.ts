import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import axios from "axios";
import { serverUrl, AUTH_SERVER_URL } from "./serverUrl";
const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      profile(profile) {
        console.log(`CLIENT ID: ${process.env.GOOGLE_CLIENT_ID}`);
        console.log(profile.sub);
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.image,
        };
      },
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.image,
        };
      },
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      const checkUser = await axios.get(
        `${serverUrl}/api/auth/checkUser/${token?.sub}`
      );
      const data = checkUser.data.message;
      if (data) {
        session.user.name = data.name;
        session.user.id = token?.sub || "";
        session.user.image = data.profilePic;
        session.user.provider = data.provider;
        session.user.userId = data._id;
      }

      return session;
    },
    async signIn({ profile, account }) {
      try {
        const checkUser = await axios.get(
          `${AUTH_SERVER_URL}/check/user/${profile?.sub}`
        );
        if (!checkUser.data.message) {
          const payload = {
            email: profile?.email,
            name: profile?.name,
            profilePic: profile?.picture,
            authId: profile?.sub,
            provider: account?.provider,
          };
          await axios.post(`${AUTH_SERVER_URL}/create/user`, payload);
        }
        return true;
      } catch (err) {
        console.log(JSON.stringify(err));
        return false;
      }
    },
  },
};

export default authOptions;
