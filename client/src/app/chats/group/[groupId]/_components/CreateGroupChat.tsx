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
    .min(1, "At least one user must be added"),
});

export type CreateGroupChatSchema = z.infer<typeof groupFormValidation>;
export type ErrorMessageSchema = {
  groupName: string | null;
  addedUsers: string | null;
};
function CreateGroupChat() {
  const router = useRouter();
  const { groupMessageSocket } = useSocketStore();
  const [createGroupForm, setCreateGroupForm] = useState<CreateGroupChatSchema>(
    {
      groupName: "",
      addedUsers: [],
    }
  );
  const [errorMessage, setErrorMessage] = useState<ErrorMessageSchema>({
    groupName: null,
    addedUsers: null,
  });
  const { setShowCreateGroupForm, showCreateGroupForm } = useModalStore();
  const [searchUserState, setSearchUserState] = useState("");
  const debouncedValue = useDebounce(searchUserState.trim());
  const { searchUser, isLoading } = useSearchUser(debouncedValue);
  const queryCLient = useQueryClient();
  const createGroup = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${GROUP_SERVER_URL}/create/groupchat`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (!groupMessageSocket) return;
      groupMessageSocket.emit("send-request", {});
      router.push("");
      queryCLient.invalidateQueries("groupchat-list");
    },
  });

  if (!showCreateGroupForm) return null;
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validateForm = groupFormValidation.safeParse(createGroupForm);
    if (validateForm.success) {
      toast.success("Successfully created your group");
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
                  createGroupForm.groupName.length <= 30
                    ? "text-[#6486FF]"
                    : "text-red-500"
                }`}
              >
                {createGroupForm.groupName.length}/30
              </span>
            </div>
            <input
              onChange={(e) => {
                const value = e.target.value;
                setCreateGroupForm((prev) => {
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
              value={createGroupForm.groupName}
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
            <label
              htmlFor="search-user"
              className="text-white text-[0.8rem] pl-1 font-bold"
            >
              Member
            </label>
            <div className="rounded-md bg-[#414141] px-2 py-2.5 flex items-center">
              <span className="text-[#6486FF] text-lg">
                <TbUserSearch />
              </span>
              <input
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
                addedUsers={createGroupForm.addedUsers}
                searchUser={searchUserState}
                setAddedUsers={setCreateGroupForm}
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
              <div className="grid grid-cols-3 gap-2 w-full px-2">
                {createGroupForm.addedUsers.map((addedUser) => (
                  <motion.div
                    layout
                    key={addedUser.id}
                    className="bg-[#6486FF]/20 h-9 rounded-3xl flex items-center space-x-2 justify-center"
                  >
                    <h6 className="text-sm text-[#6486FF]">{addedUser.name}</h6>
                    <button
                      className="text-sm text-white"
                      onClick={() =>
                        setCreateGroupForm((prevField) => {
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
            type="submit"
            className="mx-auto rounded-sm text-white font-bold text-sm bg-[#6486FF] py-2.5 px-5"
          >
            CREATE GROUP
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default CreateGroupChat;
