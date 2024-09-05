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
    <>
      <ChatUsers conversationId={params.conversationId} />
    </>
  );
}

export default Page;
