export interface MailListSchema {
  mail: {
    _id: string;
    type: string;
    isAlreadyRead: boolean;
    status: string;
    sentAt: string;
  };
}
