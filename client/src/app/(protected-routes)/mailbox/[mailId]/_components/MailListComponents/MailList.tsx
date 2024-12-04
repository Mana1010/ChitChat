"use client";
import React, { useEffect, useState } from "react";
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
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { TbTrashX } from "react-icons/tb";
import EmptyMail from "../EmptyMail";
import ConversationListSkeleton from "@/app/(protected-routes)/chats/_components/ConversationListSkeleton";
import MailListHeader from "./MailListHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSocketStore } from "@/utils/store/socket.store";
import { nanoid } from "nanoid";
function MailList({ mailId }: { mailId: string }) {
  const router = useRouter();
  const [filteredBy, setFilteredBy] = useState("all");
  const { data: session, status } = useSession();
  const { mailSocket } = useSocketStore();
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
      await axios.patch(`${APP_SERVER_URL}/update/mail/status/${mailId}`);
    },
  });
  const deleteMail = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`${APP_SERVER_URL}/delete/mail`, {
        data: selectedMail,
      });
      return response.data.message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["all-mail-list"]);
      setSelectedMail([]);
    },
  });

  const queryClient = useQueryClient();

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
    });
    if (newSelectedMails.length > 0) {
      setSelectedMail((prevMail) => [...prevMail, ...newSelectedMails]);
    }
  }

  return (
    <div className="bg-[#222222] h-full rounded-md flex flex-col relative">
      <MailListHeader
        selectOptionActivated={selectOptionActivated}
        setSelectOptionActivated={setSelectOptionActivated}
        selectAllMail={selectAllMail}
        filteredBy={filteredBy}
        setFilteredBy={setFilteredBy}
      />
      {getAllMail.isLoading || !getAllMail.data ? (
        <ConversationListSkeleton />
      ) : (
        <div className="flex-grow w-full h-[200px]">
          {(getAllMail.data?.length as number) > 0 ? (
            <div className="pt-2 flex flex-col w-full h-full overflow-y-auto items-center px-1.5">
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
          ) : (
            <EmptyMail />
          )}
        </div>
      )}
      <AnimatePresence mode="wait">
        <AlertDialog>
          <AlertDialogTrigger
            disabled={!selectedMail.length}
            onClick={(e) => e.stopPropagation()}
            className={`absolute ${
              !selectOptionActivated && "hidden"
            }  bottom-[20px] flex rounded-full w-12 h-12 text-lg text-[#6486FF] bg-[#6486FF]/20 disabled:bg-slate-600 items-center justify-center translate-x-[-50%] left-[50%]`}
          >
            <TbTrashX />
          </AlertDialogTrigger>

          <AlertDialogContent className="bg-[#171717]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#6386FE]">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-200">
                This action cannot be undone. This will permanently delete your{" "}
                {selectedMail.length > 1
                  ? `${selectedMail.length} mails`
                  : `${selectedMail.length} mail`}
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#6386FE]/55 border-none text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMail.mutate()}
                className="bg-[#6386FE]"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AnimatePresence>
    </div>
  );
}

export default MailList;
