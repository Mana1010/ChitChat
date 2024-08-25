import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { connectDb } from "@/lib/db";
import { User } from "@/model/user.model";
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
      await connectDb();
      const getUser = await User.findOne({ authId: token.sub });
      if (getUser) {
        session.user.name = getUser.name;
        session.user.id = token.sub || "";
        session.user.image = getUser.profilePic;
        session.user.provider = getUser.provider;
      }
      return session;
    },
    async signIn({ profile, account }) {
      try {
        await connectDb();
        const getUser = await User.findOne({ authId: profile?.sub });

        if (!getUser) {
          await User.create({
            email: profile?.email,
            name: profile?.name,
            profilePic: profile?.picture,
            authId: profile?.sub,
            provider: account?.provider,
          });
        }
        return true;
      } catch (err: any) {
        console.log(err);
        return false;
      }
    },
  },
};

export default authOptions;
