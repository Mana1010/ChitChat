"use client";
import React from "react";
import newUser from "../../../../../../assets/images/new-user.png";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import noGroupYet from "../../../../../../assets/images/empty-group.png";
import { useModalStore } from "@/utils/store/modal.store";
function NoGroup() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { setShowCreateGroupForm } = useModalStore();
  return (
    <div className="flex items-center justify-center w-full h-full flex-col space-y-2">
      <Image
        src={noGroupYet}
        width={300}
        height={300}
        alt="no-group-yet"
        priority
      />
      <h1 className="text-white text-center">
        You haven&apos;t joined or created any group chats yet.
      </h1>
      <button
        onClick={() => router.push(`${pathname}?type=explore-groups`)}
        className="bg-[#6486FF] py-2 px-5 rounded-md text-white"
      >
        Explore Groups
      </button>
      <span className="text-[#6486FF] font-extrabold">or</span>
      <button
        onClick={() => setShowCreateGroupForm(true)}
        className="bg-[#6486FF] py-2 px-5 rounded-md text-white"
      >
        Create Group
      </button>
    </div>
  );
}

export default NoGroup;
