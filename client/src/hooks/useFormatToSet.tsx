import { SidebarSchema } from "@/types/app.types";
import React from "react";
import { QueryClient, useQueryClient } from "react-query";
function useFormatToSet() {
  const queryClient = useQueryClient();
  const getSidebarQuery = queryClient.getQueryData<SidebarSchema>(["sidebar"]);

  const privateNotificationSet = new Set(
    getSidebarQuery?.userNotificationObj.privateNotificationCount
  );
  const groupNotificationCount = new Set(
    getSidebarQuery?.userNotificationObj.groupNotificationCount
  );
  const mailNotificationCount = new Set(
    getSidebarQuery?.userNotificationObj.mailboxNotificationCount
  );
  return {
    privateNotificationSet,
    groupNotificationCount,
    mailNotificationCount,
  };
}

export default useFormatToSet;
