import React from "react";
import { useQuery } from "react-query";
function Chatboard({ conversationId }: { conversationId: string }) {
  return <div className="text-white">{conversationId}</div>;
}

export default Chatboard;
