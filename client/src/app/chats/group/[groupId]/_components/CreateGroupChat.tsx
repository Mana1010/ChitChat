"use client";
import React, { useState } from "react";
import { IoCreateOutline } from "react-icons/io5";
import { FaXmark } from "react-icons/fa6";
import { string, z } from "zod";

const groupFormValidation = z.object({
  groupName: z
    .string()
    .min(1, "This Field is required")
    .max(20, "Group name should be 20 characters below"),
  addedUsers: z
    .object({
      profilePic: z.string(),
      name: z.string(),
    })
    .array()
    .min(1, "At least one user must be added"),
});

type CreateGroupChatSchema = z.infer<typeof groupFormValidation>;
function CreateGroupChat() {
  const groupBgColor = ["red", "blue", "yellow", "green"];
  const [createGroupForm, setCreateGroupForm] = useState<CreateGroupChatSchema>(
    {
      groupName: "",
      addedUsers: [],
    }
  );
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center px-3 w-full z-[99999999]">
      <form className="bg-[#222222] w-full md:w-[40%] h-[500px] px-3 flex flex-col rounded-md space-y-5">
        <header className="w-full items-center justify-between flex py-3">
          <div className="flex items-center space-x-2">
            <span className="text-[#6486FF] text-xl font-bold bg-zinc-700 w-8 h-8 rounded-full flex items-center justify-center">
              <IoCreateOutline />
            </span>
            <h1 className="text-white font-bold">CREATE GROUP</h1>
          </div>
          <button type="button" className="text-lg text-white">
            <FaXmark />
          </button>
        </header>
        <div className="flex-grow flex flex-col h-full w-full space-y-3">
          <div className="flex flex-col space-y-1">
            <div className="flex space-x-2">
              <label
                htmlFor="group-name"
                className="text-white text-[0.8rem] pl-1 font-bold"
              >
                Group Name
              </label>
            </div>
            <input
              onChange={(e) =>
                setCreateGroupForm((prev) => {
                  return { ...prev, groupName: createGroupForm.groupName };
                })
              }
              value={createGroupForm.groupName}
              id="group-name"
              name="group-name"
              type="text"
              className="rounded-md bg-[#414141] flex-grow px-3 py-2.5 text-white"
              placeholder="Name of your group"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex space-x-2">
              <label
                htmlFor="group-name"
                className="text-white text-[0.8rem] pl-1 font-bold"
              >
                To
              </label>
            </div>
            <input
              onChange={(e) =>
                setCreateGroupForm((prev) => {
                  return { ...prev, groupName: createGroupForm.groupName };
                })
              }
              value={createGroupForm.groupName}
              id="group-name"
              name="group-name"
              type="text"
              className="rounded-md bg-[#414141] flex-grow px-3 py-2.5 text-white"
              placeholder="Name of your group"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateGroupChat;
