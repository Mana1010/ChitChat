import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { GoTrash } from "react-icons/go";
import useDeleteMail from "@/hooks/useDeleteMail.hook";
import loadingIcon from "../../../../../assets/images/gif-animation/chat-loading.gif";

function DeleteMailBtn({ mailId }: { mailId: string }) {
  const { deleteMail, deleteMailLoading } = useDeleteMail(mailId);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={() => deleteMail()}
          disabled={deleteMailLoading}
          className="bg-red-500 px-3 py-2 rounded-sm text-white text-[0.9rem]"
        >
          {deleteMailLoading ? (
            <Image
              src={loadingIcon}
              alt="loading-icon"
              width={20}
              height={20}
              priority
            />
          ) : (
            <GoTrash />
          )}
        </TooltipTrigger>
        <TooltipContent className="bg-[#6486FF] text-white">
          <p>Delete Mail</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default DeleteMailBtn;
