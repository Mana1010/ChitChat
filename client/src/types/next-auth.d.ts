export interface User {
  name: string;
  image: string;
  email: string;
  id: string;
  provider: string;
}

declare module "next-auth" {
  interface Session {
    user: User;
  }
}
export {};
