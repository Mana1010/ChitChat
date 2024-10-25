import React, { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { User } from "@/types/UserTypes";
import LoadingChat from "@/components/LoadingChat";
import { CreateGroupChatSchema } from "./CreateGroupChat";

type AddedUsers = { id: string; name: string };

interface SearchUserSchema {
  allUserSearch: User[] | undefined;
  isLoading: boolean;
  addedUsers: AddedUsers[];
  setAddedUsers: Dispatch<SetStateAction<CreateGroupChatSchema>>;
}
function SearchUser({
  allUserSearch,
  isLoading,
  addedUsers,
  setAddedUsers,
}: SearchUserSchema) {
  function isUserAlreadyAdded(userId: string) {
    return addedUsers.some((user) => user.id === userId); //If the user already added will return true else false;
  }

  return (
    <div className="absolute top-[64px] bg-[#222222] left-0 right-0 py-1.5 overflow-y-auto mx-3 rounded-sm h-[200px] border-[1px] border-slate-500">
      {isLoading ? (
        <LoadingChat />
      ) : (
        <div>
          {allUserSearch?.map((userDetails) => (
            <div
              key={userDetails._id}
              className="flex w-full items-center p-1.5 justify-between"
            >
              <div className="flex items-center space-x-2">
                <div className="rounded-full relative w-8 h-8">
                  <Image
                    src={userDetails.profilePic}
                    alt={`${userDetails.name}'s profile picture`}
                    fill
                    sizes="100%"
                    className="absolute rounded-full"
                    priority
                  />
                  <span
                    className={`${
                      userDetails.status === "Online"
                        ? "bg-green-500"
                        : "bg-red-500"
                    } w-2 h-2 rounded-full absolute bottom-[1px] right-1`}
                  ></span>
                </div>
                <h1 className="text-white text-sm font-bold">
                  {userDetails.name}
                </h1>
              </div>
              <button
                disabled={isUserAlreadyAdded(userDetails._id)}
                type="button"
                onClick={() =>
                  setAddedUsers((prevField) => {
                    return {
                      ...prevField,
                      addedUsers: [
                        ...prevField.addedUsers,
                        {
                          id: userDetails._id,
                          name: userDetails.name,
                        },
                      ],
                    };
                  })
                }
                className="bg-[#6486FF] py-2 text-white text-sm px-3 rounded-sm disabled:bg-slate-600"
              >
                {isUserAlreadyAdded(userDetails._id) ? "Added" : "Add"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchUser;
