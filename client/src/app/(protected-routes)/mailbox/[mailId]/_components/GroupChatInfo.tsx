import { MailDetailsSchema } from "@/types/app.types";
import React from "react";
import { motion } from "framer-motion";
interface GroupChatInfoProps {
  getGroupInfo: Pick<MailDetailsSchema, "group_details"> | undefined;
}
function GroupChatInfo({ getGroupInfo }: GroupChatInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0.3, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      exit={{ scale: 0, opacity: 0.3 }}
      className="absolute inset-x-0 rounded-sm bg-[#414141] backdrop-brightness-105 bottom-[70px] py-5"
    ></motion.div>
  );
}

export default GroupChatInfo;
