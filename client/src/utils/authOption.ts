import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { connectDb } from "@/lib/db";
import { User } from "@/model/user.model";
import axios, { AxiosResponse } from "axios";
import { serverUrl } from "./serverUrl";
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
      const getUser: AxiosResponse<any, any> = await axios.get(
        `${serverUrl}/api/auth/checkUser/${token.sub}`
      );
      const data = getUser.data.message;
      console.log(data);
      if (data) {
        session.user.name = data.name;
        session.user.id = token.sub || "";
        session.user.image = data.profilePic;
        session.user.provider = data.provider;
        session.user.userId = data._id;
      }
      return session;
    },
    async signIn({ profile, account }) {
      try {
        const checkUser: AxiosResponse<any, any> = await axios.get(
          `${serverUrl}/api/auth/checkUser/${profile?.sub}`
        );
        const payload = {
          email: profile?.email,
          name: profile?.name,
          profilePic: profile?.picture,
          authId: profile?.sub,
          provider: account?.provider,
        };
        if (!Boolean(checkUser.data.message)) {
          console.log(payload);
          const response = await axios.post(
            `${serverUrl}/api/auth/createUser`,
            payload
          );
          console.log(response.data.message);
        }
        return true;
      } catch (err) {
        console.log("Please try again!");
        return false;
      }
    },
  },
};

export default authOptions;
