import React from "react";
import MailList from "../_components/MailListComponents/MailList";

type MailParams = {
  params: {
    mailId: string;
  };
};
function Page({ params }: MailParams) {
  return (
    <div className="w-full h-full">
      <MailList mailId={params.mailId} />
    </div>
  );
}

export default Page;
