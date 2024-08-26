export interface User {
  name: string;
  image: string;
  email: string;
  id: string;
  provider: string;
  userId: string;
}

declare module "next-auth" {
  interface Session {
    user: User;
  }
  interface Profile {
    picture: string;
  }
}

export {};
