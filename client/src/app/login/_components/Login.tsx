"use client";
import React from "react";
import { TbMessages } from "react-icons/tb";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
function Login() {
  const loginVariant = {
    initial: {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
    },
    visible: {
      clipPath: "polygon(0 0, 60% 0, 100% 100%, 0% 100%)",
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };
  const { status, data: session } = useSession();
  const router = useRouter();
  if (session?.user) router.push("/chats/public");
  return (
    <motion.div
      variants={loginVariant}
      initial="initial"
      animate="visible"
      className="bg-[#1D1F2B] absolute inset-0 flex flex-col h-screen"
    >
      <header className="w-full p-4">
        <div className="flex items-center space-x-2">
          <span className="text-[#6486FF] text-xl">
            <TbMessages />
          </span>
          <h3 className="text-white tracking-wide text-xl font-semibold">
            ChitChat
          </h3>
        </div>
      </header>

      <div className="w-1/2 flex-col flex-grow justify-center flex px-10">
        <h1 className="font-semibold text-[#6486FF] text-[3rem] text-center">
          WELCOME TO <span className="text-white">ChitChat</span>
        </h1>
        {status === "authenticated" ? (
          <div className="flex w-full items-center flex-col justify-center space-y-2">
            <button
              onClick={() => router.back()}
              className="bg-primary rounded-sm py-2 px-4 text-secondary"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="space-y-2 w-full items-center justify-center">
            <button
              onClick={() => {
                signIn("google", { callbackUrl: "/chats/public" });
              }}
              className="flex space-x-2 py-2.5 px-4 items-center rounded-xl text-white font-semibold border border-[#6486FF] w-full justify-center"
            >
              <span>
                <FcGoogle />
              </span>
              <span>Login with Google</span>
            </button>
          </div>
        )}
      </div>
      <footer className="absolute bottom-0 left-0 right-0 items-center justify-center flex flex-col space-y-2"></footer>
    </motion.div>
  );
}

export default Login;
