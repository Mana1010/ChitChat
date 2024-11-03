"use client";
import React from "react";
import Image from "next/image";
import { useQuery, UseQueryResult } from "react-query";
import axios, { AxiosError } from "axios";
import { APP_SERVER_URL } from "@/utils/serverUrl";
import { MailDetailsSchema } from "@/types/app.types";
import { MdGroups } from "react-icons/md";
import mailInvitation from "../../../../../assets/images/mail-invitation.png";
import { User } from "@/types/UserTypes";
function MessageText() {
  return (
    <div className="w-full flex flex-col relative overflow-hidden text-white">
      <h1>Message Mail</h1>
    </div>
  );
}

export default MessageText;
