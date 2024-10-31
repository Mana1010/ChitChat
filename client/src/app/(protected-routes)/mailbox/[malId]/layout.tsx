import React, { ReactNode } from "react";
import MailProvider from "@/context/MailProvider";
interface MailRoutes {
  mailDetails: ReactNode;
  mailList: ReactNode;
  children: ReactNode;
}
function MailLayout({ mailDetails, mailList, children }: MailRoutes) {
  return (
    <MailProvider>
      {mailList}
      {mailDetails}
      {children}
    </MailProvider>
  );
}

export default MailLayout;
