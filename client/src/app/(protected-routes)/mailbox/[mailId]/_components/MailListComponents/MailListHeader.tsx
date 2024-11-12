import React, { Dispatch, SetStateAction } from "react";
import { TbMessage } from "react-icons/tb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HiOutlineDotsVertical } from "react-icons/hi";

interface MailListHeaderSchemaProps {
  selectOptionActivated: boolean;
  setSelectOptionActivated: Dispatch<SetStateAction<boolean>>;
  selectAllMail: () => void;
  filteredBy: string;
  setFilteredBy: Dispatch<SetStateAction<string>>;
}
function MailListHeader({
  selectOptionActivated,
  setSelectOptionActivated,
  selectAllMail,
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
              {filteredBy.charAt(0).toUpperCase() + `${filteredBy.slice(1)}`}
            </SelectTrigger>
            <SelectContent className="bg-[#414141] text-white">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
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
    </header>
  );
}

export default MailListHeader;
