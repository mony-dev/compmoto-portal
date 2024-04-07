import { AdminRole, UserRole } from "@prisma/client";

export const PROJECT_NAME = "Link2Team";
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;
export const API_VERSION = "1.0.0";

export const ADMIN_ROLES = [AdminRole.SuperAdmin, AdminRole.Admin];
export const USER_ROLES = [UserRole.User, UserRole.Tester];

export const PHONE_VERIFICATION_TIMEOUT_IN_MINS = 10;

export const X_COMPANY_ID_HEADER = "X-Company-Id";

export const COMMENT_OF_POST_COUNT = 3;
export const SUB_COMMENT_OF_COMMENT_COUNT = 1;

export const NOTIFICATION_TEXT_MAX_LENGTH = 30;

// FCM Notifications
export const ANDROID_NOTIFICATION_CHANNEL_ID = "posts-and-comments";
export const TIME_ZONE = "Asia/Bangkok";

// Limit import file size mb
export const VIDEO_FILE_MAX_SIZE = 50 * 1024 * 1024; // 2MB
export const IMAGE_FILE_MAX_SIZE = 2 * 1024 * 1024; // 2MB

export const DATE_FORMAT = "dd/MM/yyyy";
