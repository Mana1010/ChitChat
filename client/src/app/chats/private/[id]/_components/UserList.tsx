"use client";
import React from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";
import { serverUrl } from "@/utils/serverUrl";
function UserList() {
  const router = useRouter();
  const { data: session } = useSession();
  const displayAllUsers = useQuery({
    queryKey: ["user-list"],
    queryFn: async () => {
      const response = await axios.get(`${serverUrl}/api/messages/user-list`);
      return response.data.message;
    },
  });
  return (
    <div className="pt-2 flex flex-col items-center flex-grow w-full overflow-y-auto">
      {displayAllUsers.data?.map((user: any, index: number) => (
        <div
          key={index}
          className="flex space-x-2 items-center w-full p-3.5 cursor-pointer hover:bg-black/40 rounded-lg"
        >
          <div className="w-[40px] h-[40px] relative rounded-full">
            <Image
              src={user.profilePic}
              alt="profile-pic"
              fill
              sizes="100%"
              priority
              className="rounded-full absolute"
            />
            <span className="bg-green-500 absolute bottom-[3px] right-[2px] w-2 h-2 rounded-full"></span>
          </div>{" "}
          <h1 className="text-white font-bold text-sm">
            {user._id === session?.user.userId ? "You" : user.name}
          </h1>
        </div>
      ))}
    </div>
  );
}

export default UserList;
