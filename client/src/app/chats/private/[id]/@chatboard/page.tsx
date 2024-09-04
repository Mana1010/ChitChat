import React from "react";
import Chatboard from "../_components/Chatboard";
function Page({ params }: { params: { id: string } }) {
  console.log(params.id);
  return (
    <div className="col-span-4 bg-[rgb(34,34,34)] flex-grow rounded-md">
      <Chatboard conversationId={params.id} />
    </div>
  );
}

export default Page;
