import React from "react";
import MailDetails from "../_components/MailDetails";
type MailParams = {
  params: {
    mailId: string;
  };
};
function Page({ params }: MailParams) {
  return (
    <div className="col-span-2 text-white">
      <MailDetails mailId={params.mailId} />
    </div>
  );
}

export default Page;
