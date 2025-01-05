"use client";
import React, { useEffect, useRef, useState } from "react";
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
import { APP_SERVER_URL } from "@/utils/serverUrl";
import { useSession } from "next-auth/react";
import { MailListSchema } from "@/types/app.types";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import EmptyMail from "../EmptyMail";
import ConversationListSkeleton from "@/app/(protected-routes)/chats/_components/ConversationListSkeleton";
import MailListHeader from "./MailListHeader";
import { handleNotificationDecrement } from "@/utils/sharedUpdateFunction";
import { useSocketStore } from "@/utils/store/socket.store";
import { nanoid } from "nanoid";
import debounceScroll from "@/utils/debounceScroll";
import {
  DEFAULT_SCROLL_VALUE,
  MAIL_LIST_SESSION_KEY,
} from "@/utils/storageKey";
function MailList({ mailId }: { mailId: string }) {
  const router = useRouter();
  const [filteredBy, setFilteredBy] = useState("all");
  const { data: session, status } = useSession();
  const { mailSocket } = useSocketStore();
  const [selectOptionActivated, setSelectOptionActivated] = useState(false);
  const mailListRef = useRef<HTMLDivElement | null>(null);
  const debounce = debounceScroll(MAIL_LIST_SESSION_KEY);
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
      await axios.patch(`${APP_SERVER_URL}/update/mail/status/${mailId}`);
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (mailListRef.current) {
      const scrollPosition = sessionStorage.getItem(MAIL_LIST_SESSION_KEY)
        ? JSON.parse(sessionStorage.getItem(MAIL_LIST_SESSION_KEY) || "")
        : sessionStorage.setItem(MAIL_LIST_SESSION_KEY, DEFAULT_SCROLL_VALUE);
      mailListRef.current.scrollTop = scrollPosition;
    }
  }, []);
  useEffect(() => {
    if (!mailSocket) return;
    mailSocket.on("update-mail", ({ sentAt, isAlreadyRead, kind }) => {
      queryClient.setQueryData<MailListSchema[] | undefined>(
        ["all-mail-list", filteredBy],
        (prevData) => {
          if (prevData) {
            return [
              {
                _id: nanoid(), //As temporary id
                isAlreadyRead,
                kind,
                sentAt,
              },
              ...prevData,
            ];
          }
        }
      );
    });
    return () => {
      if (mailSocket) {
        mailSocket.off("update-mail");
      }
    };
  }, [filteredBy, mailSocket, queryClient]);
  function handleMailStatusChange(mailId: string) {
    queryClient.setQueryData<MailListSchema[] | undefined>(
      ["all-mail-list", filteredBy],
      (cachedData: MailListSchema[] | undefined) => {
        if (cachedData) {
          return cachedData.map((data) => {
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
    handleNotificationDecrement(queryClient, "totalUnreadMail", mailId);
  }
  function handleOpenMail(mailId: string, isAlreadyOpenMail: boolean) {
    if (!isAlreadyOpenMail) {
      updateMailStatus.mutate(mailId); //Will trigger if the user is not open the mail yet
      handleMailStatusChange(mailId);
    }
    router.push(`/mailbox/${mailId}`);
  }

  return (
    <div className="side-background h-full rounded-md flex flex-col relative">
      <MailListHeader filteredBy={filteredBy} setFilteredBy={setFilteredBy} />
      {getAllMail.isLoading || !getAllMail.data ? (
        <ConversationListSkeleton />
      ) : (
        <div className="flex-grow w-full h-[200px]">
          {(getAllMail.data?.length as number) > 0 ? (
            <div
              ref={mailListRef}
              onScroll={(e) => {
                if (mailListRef.current) {
                  const scroll = mailListRef.current.scrollTop;
                  debounce(scroll, 200);
                }
              }}
              className="pt-2 flex flex-col w-full h-full overflow-y-auto items-center px-1.5"
            >
              {getAllMail.data?.map((mail) => (
                <motion.button
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
                </motion.button>
              ))}
            </div>
          ) : (
            <EmptyMail />
          )}
        </div>
      )}
    </div>
  );
}

export default MailList;
