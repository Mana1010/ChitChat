import React from "react";
import ChatGroups from "../_components/ChatGroups";

function Page({
  params,
}: {
  params: {
    groupId: string;
  };
}) {
  return (
    <>
      <ChatGroups groupId={params.groupId} />
    </>
  );
}

export default Page;
