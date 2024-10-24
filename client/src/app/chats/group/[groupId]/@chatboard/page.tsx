import React from "react";
import GroupChatboard from "../_components/GroupChatboard";

function Page({ params }: { params: { groupId: string } }) {
  return (
    <div className="bg-[rgb(34,34,34)] rounded-md col-span-2">
      <GroupChatboard groupId={params.groupId} />
    </div>
  );
}

export default Page;
