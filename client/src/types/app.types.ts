export interface MailListSchema {
  mail: {
    _id: string;
    type: string;
    isAlreadyRead: boolean;
    status: string;
    sentAt: string;
  };
}
export interface MailDetailsSchema {
  createdAt: string;
  group_details: {
    groupName: string;
    groupPhoto: {
      publicId: string;
      photoUrl: string;
    };
    total_member: number;
    _id: string;
  };
}
