import React from "react";
import ChatUsers from "../_components/ChatUsers";

function Page({
  params,
}: {
  params: {
    conversationId: string;
  };
}) {
  return (
    <div className="w-full h-full">
      <ChatUsers conversationId={params.conversationId} />
    </div>
  );
}

export default Page;
