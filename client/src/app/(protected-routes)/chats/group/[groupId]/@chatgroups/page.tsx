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
    <div className="w-full h-full">
      <ChatGroups groupId={params.groupId} />
    </div>
  );
}

export default Page;
