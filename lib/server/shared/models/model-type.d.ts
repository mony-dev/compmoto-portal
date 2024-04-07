import {
  Comment,
  Company,
  Device,
  Post,
  PublicProfile,
  Reaction,
  User,
  PostAnswer,
  Notification,
  Admin,
  Department,
  File,
  ReportComment,
} from "@prisma/client";

export type UserData = User & {
  department?: DepartmentData | null;
};

export type DepartmentData = Department & {};

export type AdminData = Admin & {};

export type PostAnswerData = PostAnswer & { _count?: Prisma.PostAnswerCountOutputTypeArgs };

export type DeviceData = Device & { user?: User };

export type PostData = Post & {
  company?: CompanyData;
  publicProfile?: PublicProfileData | null;
  comments?: CommentData[];
  commentCount?: number;
  reaction?: Reaction | null;
  reactions?: Reaction[];
  answered?: PostAnswerData | null;
  createdByAdmin?: AdminData;
  updatedByAdmin?: AdminData | null;
  departments?: DepartmentData[];
  files?: FileData[];
  postAnswers?: PostAnswerData[] | null;
};

export type CompanyData = Company;

export type PublicProfileData = PublicProfile & {
  admins?: AdminData[];
};

export type CommentData = Comment & {
  user?: User;
  comment?: CommentData;
  comments?: CommentData[];
  reaction?: Reaction | null;
  reactions?: Reaction[];
  _count?: CommentCountOutputType;
  post?: PostData;
};

export type NotificationData = Notification & {
  comment?: CommentData | null;
  post?: PostData | null;
  user?: UserData;
};

export type FileData = File & {};

export type ReportCommentData = ReportComment & { post?: PostData; comment?: CommentData; count?: number };

export type StaticContentData = StaticContent & {};
