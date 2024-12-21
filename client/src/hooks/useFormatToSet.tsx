import { SidebarSchema } from "@/types/app.types";
import React from "react";
import { useQueryClient } from "react-query";
function useFormatToSet() {
  const queryClient = useQueryClient();
  const getSidebarQuery = queryClient.getQueryData<SidebarSchema>(["sidebar"]);

  const privateNotificationSet = new Set(
    getSidebarQuery?.userNotificationObj.totalUnreadPrivateConversation
  );
  const groupNotificationCount = new Set(
    getSidebarQuery?.userNotificationObj.totalUnreadGroupConversation
  );
  const mailNotificationCount = new Set(
    getSidebarQuery?.userNotificationObj.totalUnreadMail
  );
  return {
    privateNotificationSet,
    groupNotificationCount,
    mailNotificationCount,
  };
}

export default useFormatToSet;
