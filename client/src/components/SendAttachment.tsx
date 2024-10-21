"use client";
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { IoCloudUpload } from "react-icons/io5";
import { FaFileAlt } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { useMutation } from "react-query";
import axios from "axios";
import { serverUrl } from "@/utils/serverUrl";
import { UploadButton, UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/api/uploadthing/core";
import { toast } from "sonner";

interface SendAttachmentProps {
  setOpenAttachmentModal: Dispatch<SetStateAction<boolean>>;
}
function SendAttachment({ setOpenAttachmentModal }: SendAttachmentProps) {
  const [fileSelected, setFileSelected] = useState<{
    fileName: string;
    size: number;
    sizeType: string;
  } | null>(null);
  return (
    <div className="absolute inset-0 items-center justify-center flex px-3 bg-black/30 z-[9999]">
      <div className="bg-[#1F1F1F] rounded-md w-full md:w-1/2 p-3 h-[400px] relative items-center justify-center flex flex-col space-y-3">
        <div className="flex w-full justify-end">
          <button
            onClick={() => setOpenAttachmentModal((prev) => !prev)}
            className="text-white text-lg"
          >
            <FaXmark />
          </button>
        </div>
        {
          <UploadButton<OurFileRouter, any>
            endpoint="documentUpload"
            onClientUploadComplete={(data) => {
              toast.success("Success!");
            }}
            onUploadBegin={() => {
              toast.success("On Upload begin");
            }}
            onUploadError={() => {
              toast.error("Error");
            }}
          />
        }
        <button
          disabled={!fileSelected}
          type="submit"
          className="w-1/2 py-2 rounded-sm bg-[#6486FF] text-white text-sm disabled:bg-slate-500"
        >
          Send Attachment
        </button>
      </div>
    </div>
  );
}

export default SendAttachment;
