"use client";
import React, { ChangeEvent, useState } from "react";
import { IoCloudUpload } from "react-icons/io5";
import { FaFileAlt } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
function SendAttachment() {
  const [fileSelected, setFileSelected] = useState<string | null>(null);
  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSelected(file.name);
    }
  };
  return (
    <div className="absolute inset-0 items-center justify-center flex px-3 bg-black/30 z-[9999]">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-[#1F1F1F] rounded-md w-full md:w-1/2 p-3 h-[300px] relative items-center justify-center flex flex-col space-y-4"
      >
        <input
          onChange={handleFileSelected}
          type="file"
          accept=".pdf, .doc, .docx"
          className="hidden"
          id="send-attachment"
        />
        <label
          htmlFor="send-attachment"
          className="flex items-center justify-center w-full border-dashed border-[1px] border-zinc-500/90 flex-grow"
        >
          {fileSelected ? (
            <div className="flex justify-between items-center w-full mx-2 py-2 px-1.5 shadow-sm shadow-black">
              <div className="space-x-2 flex items-center text-[#6486FF]">
                <span>
                  <FaFileAlt />
                </span>
                <h2 className="text-sm">{fileSelected}</h2>
              </div>
              <button
                onClick={(e) => {
                  setFileSelected(null);
                }}
                type="button"
                className="text-white"
              >
                <FaXmark />
              </button>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center space-y-1">
              <span className="text-4xl text-[#6486FF]">
                <IoCloudUpload />
              </span>
              <label
                htmlFor="send-attachment"
                className="text-white text-sm hover:underline hover:decoration-blue-600 hover:text-blue-600"
              >
                Send an attachment
              </label>
              <span className="text-white text-[0.6rem]">
                Only PDF, DOC, AND DOCX
              </span>
            </div>
          )}
        </label>
        <button
          disabled={!fileSelected}
          type="submit"
          className="w-1/2 py-2 rounded-sm bg-[#6486FF] text-white text-sm disabled:bg-slate-500"
        >
          Send Attachment
        </button>
      </form>
    </div>
  );
}

export default SendAttachment;
