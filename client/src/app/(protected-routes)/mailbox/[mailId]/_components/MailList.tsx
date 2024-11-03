"use client";
import React, { useState } from "react";
import { PiMailboxFill } from "react-icons/pi";
import { IoMdArrowDropright } from "react-icons/io";
import { TbMessage } from "react-icons/tb";
import { HiMail } from "react-icons/hi";
import { HiMailOpen } from "react-icons/hi";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_SERVER_URL } from "@/utils/serverUrl";
import { useSession } from "next-auth/react";
import { MailListSchema } from "@/types/app.types";
import { formatDistanceToNow } from "date-fns";
import { QueryClient } from "react-query";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Checkbox } from "@/components/ui/checkbox";
import { TbTrashX } from "react-icons/tb";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function MailList({ mailId }: { mailId: string }) {
  const router = useRouter();
  const [filteredBy, setFilteredBy] = useState("all");
  const { data: session, status } = useSession();
  const [selectedMail, setSelectedMail] = useState<string[]>([]);
  const [selectOptionActivated, setSelectOptionActivated] = useState(false);
  const selectedMailSet = new Set(selectedMail);
  const getAllMail: UseQueryResult<
    MailListSchema[],
    AxiosError<{ message: string }>
  > = useQuery({
    queryKey: ["all-mail-list", filteredBy],
    queryFn: async () => {
      const response = await axios.get(
        `${APP_SERVER_URL}/mail/list/${session?.user.userId}?filter=${filteredBy}`
      );
      return response.data.message;
    },
    enabled: status === "authenticated",
  });
  const updateMailStatus = useMutation({
    mutationFn: async (mailId: string) => {
      await axios.patch(
        `${APP_SERVER_URL}/update/mail/status/${session?.user.userId}/${mailId}`
      );
    },
  });
  const queryClient = useQueryClient();
  function handleMailStatusChange(mailId: string) {
    queryClient.setQueryData<MailListSchema[] | undefined>(
      ["all-mail-list", filteredBy],
      (cachedData: MailListSchema[] | undefined) => {
        if (cachedData) {
          return cachedData.map((data) => {
            console.log(data);
            if (data._id === mailId) {
              return {
                ...data,
                isAlreadyRead: true,
              };
            } else {
              return data;
            }
          });
        }
      }
    );
  }
  function handleOpenMail(mailId: string, isAlreadyOpenMail: boolean) {
    if (!isAlreadyOpenMail) {
      updateMailStatus.mutate(mailId); //Will trigger if the user is not open the mail yet
      handleMailStatusChange(mailId);
    }
    router.push(`/mailbox/${mailId}`);
  }
  function handleSelectedMail(mailId: string, ifMailAlreadySelected: boolean) {
    if (!ifMailAlreadySelected) {
      setSelectedMail((allSelectedMailId) =>
        allSelectedMailId.filter((selectedMail) => selectedMail !== mailId)
      );
    } else {
      setSelectedMail((prevSelectedMailId) => [...prevSelectedMailId, mailId]);
    }
  }
  function handleCheckboxValue(mailId: string) {
    return selectedMailSet.has(mailId);
  }
  function selectAllMail() {
    const newSelectedMails: string[] = [];

    getAllMail.data?.forEach((mail) => {
      if (!selectedMailSet.has(mail._id)) {
        newSelectedMails.push(mail._id);
      }

      if (newSelectedMails.length > 0) {
        setSelectedMail((prevMail) => [...prevMail, ...newSelectedMails]);
      }
    });
  }
  return (
    <div className="bg-[#222222] h-full rounded-md flex flex-col relative">
      <header className="w-full p-2.5 space-y-2 ">
        <div className="flex items-center space-x-2">
          <span className="text-[#6486FF] text-xl">
            <TbMessage />
          </span>
          <h3 className="text-white tracking-wide text-xl font-extrabold">
            ChitChat
          </h3>
        </div>
      </header>
      <div className="w-full flex-grow flex flex-col">
        <div className="w-full flex justify-between px-2.5">
          {!selectOptionActivated && (
            <h1 className="text-[#6486FF] font-extrabold self-end text-[0.83rem]">
              ALL MAIL
            </h1>
          )}
          {selectOptionActivated && (
            <button
              onClick={selectAllMail}
              className="text-[#6486FF] font-extrabold self-end text-[0.83rem] rounded-sm"
            >
              SELECT ALL
            </button>
          )}
          <div className="flex space-x-2 items-center">
            <Select
              value={filteredBy}
              onValueChange={(selectedValue) => setFilteredBy(selectedValue)}
            >
              <SelectTrigger className="w-[130px] text-[#6486FF] border-none bg-[#3A3B3C]">
                <SelectValue
                  placeholder={`${filteredBy}`}
                  className="text-white"
                />
              </SelectTrigger>
              <SelectContent className="bg-[#414141] text-white">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="popular">Read</SelectItem>
                <SelectItem value="unpopular">Unread</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-white text-lg">
                <HiOutlineDotsVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#454545] ml-2 text-white">
                <DropdownMenuItem
                  onClick={() => setSelectOptionActivated((prev) => !prev)}
                >
                  {selectOptionActivated ? "Undo" : "Select"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="pt-2 flex flex-col w-full overflow-y-auto h-[98%] items-center px-1.5">
          {getAllMail.data?.map((mail) => (
            <motion.label
              htmlFor={`delete-mail-${mail._id}`}
              layout
              onClick={() => {
                if (!selectOptionActivated) {
                  handleOpenMail(mail._id, mail.isAlreadyRead);
                }
                return;
              }}
              key={mail._id}
              className={`flex items-center w-full py-3.5 px-3 cursor-pointer hover:bg-[#414141] rounded-lg justify-between ${
                mail._id === mailId && "bg-[#414141]"
              }`}
            >
              <div className="flex items-center space-x-2">
                {selectOptionActivated && (
                  <Checkbox
                    checked={handleCheckboxValue(mail._id)}
                    onCheckedChange={(ifMailAlreadySelected) =>
                      handleSelectedMail(
                        mail._id,
                        ifMailAlreadySelected as boolean
                      )
                    }
                    id={`delete-mail-${mail._id}`}
                  />
                )}

                <span className="text-3xl text-[#6486FF]">
                  {mail.isAlreadyRead ? <HiMailOpen /> : <HiMail />}
                </span>
                <div className="flex justify-start flex-col items-start">
                  <h4
                    className={`text-white ${
                      !mail.isAlreadyRead && "font-bold"
                    } text-sm break-all`}
                  >
                    {formatDistanceToNow(new Date(mail.sentAt), {
                      addSuffix: true,
                    })}
                  </h4>
                </div>
              </div>
              <span
                className={`w-2.5 h-2.5 rounded-full items-center justify-center bg-[#6486FF] ${
                  mail.isAlreadyRead ? "hidden" : "flex"
                }`}
              ></span>
            </motion.label>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {selectOptionActivated && (
          <motion.button
            initial={{ opacity: 0.5, bottom: "-10px" }}
            animate={{ opacity: 1, bottom: "20px" }}
            transition={{ duration: 0.2, ease: "easeIn", type: "spring" }}
            exit={{ opacity: 0, bottom: "-10px" }}
            onClick={(e) => e.stopPropagation()}
            className="absolute rounded-full w-12 h-12 text-lg text-[#6486FF] bg-[#6486FF]/20 flex items-center justify-center translate-x-[-50%] left-[50%]"
          >
            <TbTrashX />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MailList;
