"use client";
import React, { FormEvent, useState } from "react";
import { IoCreateOutline } from "react-icons/io5";
import { FaXmark } from "react-icons/fa6";
import { z } from "zod";
import { TbUserSearch } from "react-icons/tb";
import SearchUser from "./SearchUser";
import useDebounce from "@/hooks/useDebounce.hook";
import useSearchUser from "@/hooks/useSearchUser.hook";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useMutation } from "react-query";
import axios from "axios";
import { GROUP_SERVER_URL } from "@/utils/serverUrl";
import { useSocketStore } from "@/utils/store/socket.store";
import { useQueryClient } from "react-query";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/utils/store/modal.store";
import { randomProfile } from "@/utils/randomProfile";
import { useSession } from "next-auth/react";
import loadingAnimation from "../../../../../../assets/images/gif-animation/component-loading.gif";
import Image from "next/image";
const groupFormValidation = z.object({
  groupName: z
    .string()
    .min(1, "This field is required")
    .max(30, "Group name should be 30 characters below"),
  addedUsers: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .array()
    .min(1, "At least one user must be added")
    .max(10, "Invite limit reached! You can only invite up to 10 people."),
});

export type CreateGroupChatSchema = z.infer<typeof groupFormValidation>;
export type ErrorMessageSchema = {
  groupName: string | null;
  addedUsers: string | null;
};
type GroupPayloadSchema = Pick<CreateGroupChatSchema, "groupName"> & {
  creatorId: string | undefined;
  groupProfileIcon: string;
};
function CreateGroupChat() {
  const { data, status } = useSession();
  const router = useRouter();
  const { groupSocket } = useSocketStore();
  const [createGroupFormPayload, setCreateGroupFormPayload] =
    useState<CreateGroupChatSchema>({
      groupName: "",
      addedUsers: [],
    });
  const [errorMessage, setErrorMessage] = useState<ErrorMessageSchema>({
    groupName: null,
    addedUsers: null,
  });
  const { setShowCreateGroupForm, showCreateGroupForm } = useModalStore();
  const [searchUserState, setSearchUserState] = useState("");
  const debouncedValue = useDebounce(searchUserState.trim());
  const { searchUser, isLoading } = useSearchUser(debouncedValue);
  const queryClient = useQueryClient();
  const createGroup = useMutation({
    mutationFn: async (payload: GroupPayloadSchema) => {
      const response = await axios.post(
        `${GROUP_SERVER_URL}/create/groupchat`,
        payload
      );
      return response.data.message;
    },
    onSuccess: (data) => {
      if (!groupSocket) return;
      groupSocket.emit("send-request", {
        requestedUsers: createGroupFormPayload.addedUsers,
        groupId: data.groupId,
      });
      queryClient.invalidateQueries(["groupchat-list"]);
      queryClient.invalidateQueries(["sidebar"]);
      setShowCreateGroupForm(false);
      setCreateGroupFormPayload({
        groupName: "",
        addedUsers: [],
      });
      router.push(`/chats/group/${data.groupId}?type=chats`);
    },
  });

  if (!showCreateGroupForm) return null;
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validateForm = groupFormValidation.safeParse(createGroupFormPayload);
    if (validateForm.success) {
      toast.success(data?.user.userId);
      const updatedPayload = {
        groupName: createGroupFormPayload.groupName,
        creatorId: data?.user.userId,
        groupProfileIcon: randomProfile(),
      };
      createGroup.mutate(updatedPayload);
    } else {
      validateForm.error.errors.forEach((errorMessage) => {
        setErrorMessage((prevErrMessage) => {
          return {
            ...prevErrMessage,
            [errorMessage.path[0]]: errorMessage.message,
          };
        });
      });
    }
  }
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.1, ease: "easeIn" }}
      className="absolute inset-0 bg-black/60 flex items-center justify-center px-3 w-full z-[99999999]"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-[#222222] w-full md:w-[40%] h-[500px] px-3 flex flex-col rounded-md space-y-5"
      >
        <header className="w-full items-center justify-between flex py-3">
          <div className="flex items-center space-x-2">
            <span className="text-[#6486FF] text-xl font-bold bg-zinc-700 w-8 h-8 rounded-full flex items-center justify-center">
              <IoCreateOutline />
            </span>
            <h1 className="text-white font-bold">CREATE GROUP</h1>
          </div>
          <button
            onClick={() => setShowCreateGroupForm(false)}
            type="button"
            className="text-lg text-white"
          >
            <FaXmark />
          </button>
        </header>
        <div className="flex-grow flex flex-col w-full space-y-3">
          <div className="flex flex-col space-y-1">
            <div className="flex space-x-2">
              <label
                htmlFor="group-name"
                className="text-white text-[0.8rem] pl-1 font-bold"
              >
                Group Name
              </label>
              <span
                className={`text-[0.75rem] font-bold ${
                  createGroupFormPayload.groupName.length <= 30
                    ? "text-[#6486FF]"
                    : "text-red-500"
                }`}
              >
                {createGroupFormPayload.groupName.length}/30
              </span>
            </div>
            <input
              onChange={(e) => {
                const value = e.target.value;
                setCreateGroupFormPayload((prev) => {
                  return { ...prev, groupName: value };
                });
                //Will check if the user already trigger the error to show the error message after this.
                const isUserAlreadyTriggerError = Object.values(
                  errorMessage
                ).some((errorMessage) => errorMessage);

                if (isUserAlreadyTriggerError) {
                  const validateGroupNameField =
                    groupFormValidation.shape.groupName.safeParse(value);

                  setErrorMessage((prevField) => {
                    if (validateGroupNameField.success) {
                      return { ...prevField, groupName: null };
                    }
                    return {
                      ...prevField,
                      groupName:
                        validateGroupNameField.error?.issues[0].message,
                    };
                  });
                }
              }}
              disabled={createGroup.isLoading}
              value={createGroupFormPayload.groupName}
              id="group-name"
              name="group-name"
              type="text"
              autoComplete="off"
              className="rounded-md bg-[#414141] flex-grow px-3 py-2.5 text-white"
              placeholder="Name of your group"
            />
            {errorMessage.groupName && (
              <span className="text-red-500 text-[0.8rem]">
                {errorMessage.groupName}
              </span>
            )}
          </div>
          <div className="flex flex-col space-y-1 relative">
            <div className="flex space-x-2">
              <label
                htmlFor="search-user"
                className="text-white text-[0.8rem] pl-1 font-bold"
              >
                Member
              </label>
              <span
                className={`text-[0.75rem] font-bold ${
                  createGroupFormPayload.groupName.length <= 10
                    ? "text-[#6486FF]"
                    : "text-red-500"
                }`}
              >
                {createGroupFormPayload.addedUsers.length}/10
              </span>
            </div>
            <div className="rounded-md bg-[#414141] px-2 py-2.5 flex items-center">
              <span className="text-[#6486FF] text-lg">
                <TbUserSearch />
              </span>
              <input
                disabled={createGroup.isLoading}
                onChange={(e) => setSearchUserState(e.target.value)}
                id="search-user"
                name="search-user"
                type="text"
                autoComplete="off"
                className="bg-transparent text-white px-2 outline-none flex-grow accent-white"
                placeholder="Search a user to add"
              />
            </div>
            {searchUserState.trim() && (
              <SearchUser
                allUserSearch={searchUser}
                isLoading={isLoading}
                userId={data?.user.userId as string}
                addedUsers={createGroupFormPayload.addedUsers}
                searchUser={searchUserState}
                setAddedUsers={setCreateGroupFormPayload}
                setErrorMessage={setErrorMessage}
              />
            )}
            {errorMessage.addedUsers && (
              <span className="text-red-500 text-[0.8rem]">
                {errorMessage.addedUsers}
              </span>
            )}
          </div>
          <div className="h-[150px] w-full overflow-y-auto">
            {!errorMessage.addedUsers && (
              <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full px-2">
                {createGroupFormPayload.addedUsers.map((addedUser) => (
                  <motion.div
                    layout
                    key={addedUser.id}
                    className="bg-[#6486FF]/20 h-9 rounded-3xl flex items-center space-x-2 justify-center"
                  >
                    <h6 className="text-sm text-[#6486FF]">{addedUser.name}</h6>
                    <button
                      className="text-sm text-white"
                      onClick={() =>
                        setCreateGroupFormPayload((prevField) => {
                          return {
                            ...prevField,
                            addedUsers: prevField.addedUsers.filter(
                              (addedFilterUser) =>
                                addedFilterUser.id !== addedUser.id
                            ),
                          };
                        })
                      }
                    >
                      <FaXmark />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="pb-3 w-full flex">
          <button
            disabled={createGroup.isLoading}
            type="submit"
            className="mx-auto rounded-sm text-white font-bold text-sm bg-[#6486FF] py-1 h-11 w-1/3 disabled:bg-slate-700 flex items-center justify-center"
          >
            {createGroup.isLoading ? (
              <Image
                src={loadingAnimation}
                alt="loading-animation"
                width={35}
                height={35}
                priority
              />
            ) : (
              "CREATE GROUP"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default CreateGroupChat;
