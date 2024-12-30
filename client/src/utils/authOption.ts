import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { checkUser } from "./checkUser";
import axios from "axios";
import { AUTH_SERVER_URL } from "./serverUrl";
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
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      const { user_data, status } = await checkUser(token?.sub);

      if (status === "exist") {
        session.user.name = user_data.name;
        session.user.id = token?.sub || "";
        session.user.image = user_data.profilePic;
        session.user.provider = user_data.provider;
        session.user.userId = user_data._id;
      }
      return session;
    },
    async signIn({ profile, account }) {
      try {
        const { status } = await checkUser(profile?.sub);
        if (status === "not-exist") {
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
