"use client";
import { serverUrl } from "@/utils/serverUrl";
import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { useQuery, UseQueryResult } from "react-query";
import { useSession } from "next-auth/react";
function ChatList({ searchChat }: { searchChat: string }) {
  const { data: session } = useSession();
  const [chats, setChats] = useState([]);
  const displayAllChats: UseQueryResult<any[], any> = useQuery({
    queryKey: ["chat-list"],
    queryFn: async () => {
      const response = await axios.get(
        `${serverUrl}/api/messages/chat-list/${session?.user.userId}`
      );
      return response.data.message;
    },
  });
  console.log(displayAllChats);
  useEffect(() => {
    const searchResult = displayAllChats.data?.filter((user) =>
      new RegExp(searchChat, "i").test(user.name as string)
    );
    // setUsers(searchResult as any);
  }, []);
  return <div>ChatList</div>;
}

export default ChatList;
