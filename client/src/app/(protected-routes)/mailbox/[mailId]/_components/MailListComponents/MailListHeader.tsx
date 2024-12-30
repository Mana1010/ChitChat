import React, { Dispatch, SetStateAction } from "react";
import { TbMessage } from "react-icons/tb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface MailListHeaderSchemaProps {
  filteredBy: string;
  setFilteredBy: Dispatch<SetStateAction<string>>;
}
function MailListHeader({
  filteredBy,
  setFilteredBy,
}: MailListHeaderSchemaProps) {
  return (
    <header className="w-full p-2.5 space-y-2">
      <div className="flex items-center space-x-2">
        <span className="text-[#6486FF] text-xl">
          <TbMessage />
        </span>
        <h3 className="text-white tracking-wide text-xl font-extrabold">
          ChitChat
        </h3>
      </div>
      <div className="w-full flex justify-between px-2.5">
        <h1 className="text-[#6486FF] font-extrabold self-end text-[0.83rem]">
          ALL MAIL
        </h1>
        <div className="flex space-x-2 items-center">
          <Select
            value={filteredBy}
            onValueChange={(selectedValue) => setFilteredBy(selectedValue)}
          >
            <SelectTrigger className="w-[130px] text-[#6486FF] border-none bg-[#3A3B3C]">
              {filteredBy.charAt(0).toUpperCase() + `${filteredBy.slice(1)}`}
            </SelectTrigger>
            <SelectContent className="bg-[#414141] text-white">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}

export default MailListHeader;
