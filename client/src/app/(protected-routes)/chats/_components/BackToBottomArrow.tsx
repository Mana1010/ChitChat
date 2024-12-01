import React, { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { IoIosArrowRoundDown } from "react-icons/io";
interface BackToBottomArrowProps {
  setShowArrowDown: Dispatch<SetStateAction<boolean>>;
  scrollRef: HTMLDivElement | null;
}
function BackToBottomArrow({
  setShowArrowDown,
  scrollRef,
}: BackToBottomArrowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, bottom: "10px" }}
      animate={{ opacity: 1, bottom: "15px" }}
      transition={{ duration: 0.25, ease: "easeIn" }}
      exit={{ opacity: 0, bottom: "10px" }}
      className="flex items-center justify-center z-[999] sticky bg-transparent w-12 h-12 left-[50%] right-[50%]"
    >
      <button
        onClick={() => {
          setShowArrowDown(false);
          scrollRef?.scrollIntoView({
            block: "end",
            behavior: "smooth",
          });
        }}
        className="w-10 h-10 rounded-full flex items-center justify-center p-1 bg-[#414141] text-[#6486FF]  text-2xl"
      >
        <IoIosArrowRoundDown />
      </button>
    </motion.div>
  );
}

export default BackToBottomArrow;
