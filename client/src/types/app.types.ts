export interface MailListSchema {
  _id: string;
  type: string;
  isAlreadyRead: boolean;
  status: string;
  sentAt: string;
}
export interface MailDetailsSchema {
  senAt: string;
  body: {
    groupName: string;
    groupPhoto: {
      publicId: string;
      photoUrl: string;
    };
    _id: string;
  };
  total_member: number;
  kind: string;
  from: string;
  _id: string;
}
