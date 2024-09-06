import React from "react";
import Chatboard from "../_components/Chatboard";
function Page({ params }: { params: { conversationId: string } }) {
  return (
    <div className="bg-[rgb(34,34,34) rounded-md col-span-2">
      <Chatboard conversationId={params.conversationId} />
    </div>
  );
}

export default Page;
