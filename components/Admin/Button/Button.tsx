// import { KeyIcon, TrashIcon } from "@heroicons/react/24/outline";
// import Link, { LinkProps } from "next/link";

// import styled from "styled-components";
// import tw from "twin.macro";

// import { useAdminDeleteContext } from "../Admins/AdminDeleteContext";
// import { AdminJSON } from "@lib-admin/serializers/admin-serializer";
// import { UserJSON } from "@lib-admin/serializers/user-serializer";
// import { useUserDeleteContext } from "../User/UserDeleteContext";
// import { useTranslation } from "../../../lib/shared/translations/i18n-client";
// import { CheckIcon } from "@heroicons/react/24/solid";
// import { ReportCommentJSON } from "@lib-admin/serializers/report-comment-serializer";
// import { useReportDeleteContext } from "../Report/ReportDeleteContext";
// import { useAdminResetPasswordContext } from "../Admins/AdminResetContext";
// import { PostJSON } from "@lib-admin/serializers/post-serializer";
// import { usePostDeleteContext } from "../Posts/PostDeleteContext";

// type BaseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

// type ButtonProps = BaseButtonProps & {
//   icon?: React.ReactElement;
//   outline?: boolean;
//   danger?: boolean;
//   cancel?: boolean;
//   fullWidth?: boolean;
//   text?: boolean;
//   size?: "small" | "medium";
//   disabled?: boolean;
//   isLoading?: boolean;
// };

// const BaseButton = styled.button<ButtonProps>(({ size = "s", ...props }) => [
//   tw`bg-l2t-purple text-white border border-l2t-purple py-1 px-2 inline-flex rounded-lg min-w-[6rem] sm:w-auto text-[15px] font-medium justify-center items-center`,
//   props.icon && tw`gap-2`,
//   props.fullWidth ? tw`w-full` : tw``,
//   props.text ? tw`min-w-0 p-0 bg-transparent border-0 text-l2t-gray` : tw``,
//   props.danger ? tw`bg-l2t-red border-l2t-red` : tw``,
//   props.outline ? tw`bg-white text-l2t-purple` : tw``,
//   props.outline && props.danger ? tw`text-l2t-red` : tw``,
//   props.cancel ? tw`bg-white border-black text-l2t-gray` : tw``,
//   size === "small" ? tw`text-[15px]` : tw``,
//   size === "medium" ? tw`text-xl` : tw``,
// ]);

// const FormButton = styled.button<ButtonProps>(({ ...props }) => [
//   tw`relative flex justify-center w-full px-4 py-2 text-base text-white rounded-lg  bg-red-400 gap-2 items-center`,
//   props.isLoading && tw`bg-gray-500 cursor-wait hover:shadow-none`,
// ]);

// const LoadingSignInSpinner = styled.div`
//   ${tw`w-5 h-5 border-2 border-white rounded-full cursor-not-allowed  aspect-square animate-spin border-t-transparent`}
// `;

// export const LinkButton: React.FC<ButtonProps & LinkProps<any>> = (props) => {
//   const { icon, fullWidth, size, text, children, outline, ...linkProps } = props;
//   return (
//     <Link {...linkProps} as={undefined}>
//       <BaseButton icon={icon} fullWidth={fullWidth ? true : false} text={text ? true : false} size={size} outline={outline ? true : false}>
//         {icon && <div className="h-5 w-5">{icon}</div>}
//         {children}
//       </BaseButton>
//     </Link>
//   );
// };

// export const Button: React.FC<ButtonProps> = (props) => {
//   return (
//     <BaseButton {...props}>
//       {props.icon && <div className="h-5 w-5">{props.icon}</div>}
//       {props.children}
//     </BaseButton>
//   );
// };

// export const AdminResetPasswordButton: React.FC<{ admin: AdminJSON | null }> = ({ admin }) => {
//   const { setReset } = useAdminResetPasswordContext();
//   const { t } = useTranslation("admin");
//   return (
//     <Button outline icon={<KeyIcon />} onClick={() => setReset(admin)}>
//       {t("form.reset_password")}
//     </Button>
//   );
// };

// export const AdminDeleteButton: React.FC<{ admin: AdminJSON | null; disabled?: boolean }> = ({ admin, disabled = false }) => {
//   const { setDelete } = useAdminDeleteContext();
//   const { t } = useTranslation("admin");

//   return (
//     <Button danger outline icon={<TrashIcon />} onClick={() => setDelete(admin)} disabled={disabled}>
//       {t("form.delete")}
//     </Button>
//   );
// };

// export const UserDeleteButton: React.FC<{ user: UserJSON | null; disabled?: boolean }> = ({ user, disabled = false }) => {
//   const { setDelete } = useUserDeleteContext();
//   const { t } = useTranslation("admin");

//   return (
//     <Button danger outline icon={<TrashIcon />} onClick={() => setDelete(user)} disabled={disabled}>
//       {t("form.delete")}
//     </Button>
//   );
// };

// export const SaveButton = (props: ButtonProps) => {
//   const { t } = useTranslation("admin");
//   const icon = props.isLoading ? <LoadingSignInSpinner /> : <CheckIcon />;
//   return (
//     <Button size="medium" icon={icon} className="w-max">
//       {props.isLoading ? t("form.saving") : t("form.save")}
//     </Button>
//   );
// };

// export const ReportDeleteButton: React.FC<{ report: ReportCommentJSON | null }> = ({ report }) => {
//   const { setDelete } = useReportDeleteContext();
//   const { t } = useTranslation("admin");

//   return (
//     <Button danger outline icon={<TrashIcon />} onClick={() => setDelete(report)}>
//       {t("form.delete")}
//     </Button>
//   );
// };

// export const PostDeleteButton: React.FC<{ post: PostJSON | null; disabled?: boolean }> = ({ post, disabled = false }) => {
//   const { setDelete } = usePostDeleteContext();
//   const { t } = useTranslation("admin");

//   return (
//     <Button type="button" danger outline icon={<TrashIcon />} onClick={() => setDelete(post)} disabled={disabled}>
//       {t("form.delete")}
//     </Button>
//   );
// };

// export const SingInFormButton = (props: ButtonProps) => {
//   return (
//     <FormButton isLoading={props.isLoading} {...props}>
//       {props.isLoading && <LoadingSignInSpinner />}
//       {/* {props.children} */}
//     </FormButton>
//   );
// };
