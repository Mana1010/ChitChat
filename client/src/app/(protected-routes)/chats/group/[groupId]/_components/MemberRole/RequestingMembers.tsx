import { MemberListSchema } from "@/types/group.types";
import React from "react";

function RequestingMembers({
  member_details,
}: {
  member_details: MemberListSchema["member_details"];
}) {
  return <div>RequestingMembers</div>;
}

export default RequestingMembers;
