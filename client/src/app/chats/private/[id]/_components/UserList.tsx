"use client";
import React, { useEffect, useState } from "react";
import { useQuery, UseQueryResult } from "react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { serverUrl } from "@/utils/serverUrl";
import { User } from "@/types/UserTypes";
import noSearchFoundImg from "../../../../../assets/images/not-found.png";
import { PiHandWavingThin } from "react-icons/pi";
function UserList({ searchUser }: { searchUser: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const displayAllUsers: UseQueryResult<
    User[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["user-list"],
    queryFn: async () => {
      const response = await axios.get(`${serverUrl}/api/messages/user-list`);
      setUsers(response.data.message);
      return response.data.message;
    },
  });
  useEffect(() => {
    const searchResult = displayAllUsers.data?.filter((user) =>
      new RegExp(searchUser, "i").test(user.name as string)
    );
    setUsers(searchResult as User[]);
  }, [displayAllUsers.data, searchUser]);

  const searchResult = displayAllUsers.data?.filter((user) =>
    new RegExp(searchUser, "i").test(user.name as string)
  );
  return (
    <div className=" flex flex-grow w-full">
      {searchResult?.length === 0 ? (
        <div className=" flex w-full items-center justify-center flex-col space-y-2 px-2">
          <Image
            src={noSearchFoundImg}
            width={100}
            height={100}
            alt="no-search-found"
            priority
          />

          <h2 className="text-zinc-300 text-[1.1rem] break-all text-center">
            No &quot;
            <span className="text-[#6486FF]">{searchUser.slice(0, 10)}</span>
            &quot; user found
          </h2>
        </div>
      ) : (
        <div className="pt-2 flex flex-col w-full overflow-y-auto h-full items-center">
          {users?.map((user: User, index: number) => (
            <div
              key={index}
              className="flex items-center w-full p-3.5 cursor-pointer hover:bg-black/40 rounded-lg justify-between"
            >
              <div className="flex items-center space-x-2">
                <div className="w-[40px] h-[40px] relative rounded-full">
                  <Image
                    src={user.profilePic}
                    alt="profile-pic"
                    fill
                    sizes="100%"
                    priority
                    className="rounded-full absolute"
                  />
                  <span
                    className={`${
                      user.status === "Online" ? "bg-green-500" : "bg-zinc-500"
                    } absolute bottom-[3px] right-[2px] w-2 h-2 rounded-full`}
                  ></span>
                </div>{" "}
                <h1 className="text-white font-bold text-sm break-all">
                  {user._id === session?.user.userId ? "You" : user.name}
                </h1>
              </div>
              <button className="bg-[#3A3B3C] py-1.5 px-3 rounded-md text-yellow-400 text-xl">
                <PiHandWavingThin />
              </button>
            </div>
          ))}{" "}
        </div>
      )}
    </div>
  );
}

export default UserList;
