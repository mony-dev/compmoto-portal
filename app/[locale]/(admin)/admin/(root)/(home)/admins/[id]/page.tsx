"use client";

import { usePathname, useRouter } from "next/navigation";
import { Form, Input, Button, Select } from "antd";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { LockOutlined } from "@ant-design/icons";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  EditAdminSchema,
  editAdminSchema,
} from "@lib-schemas/user/edit-admin-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { User } from "@shared/translations/models/user";
import {
  editPasswordSchema,
  EditPasswordSchema,
} from "@lib-schemas/user/edit-password-schema";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../../i18nConfig";
import { useTranslation } from "react-i18next";
import { useCart } from "@components/Admin/Cartcontext";
import Loading from "@components/Loading";
import debounce from "lodash.debounce";

export default function Admin({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { Option } = Select;
  const [form] = Form.useForm();
  const [formPassword] = Form.useForm();
  const [userData, setUserData] = useState<User>();
  const locale = useCurrentLocale(i18nConfig);
  const {setI18nName} = useCart();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true); 
  type FieldType = {
    confirmPassword: string;
    newPassword: string;
  };

  const {
    handleSubmit: handleSubmit,
    control: control,
    formState: { errors: errors },
    setValue: setValue,
    watch: watchRole,
  } = useForm<EditAdminSchema>({
    resolver: zodResolver(editAdminSchema),
  });

  const {
    handleSubmit: handleSubmitPassword,
    control: controlPassword,
    formState: { errors: errorsPassword },
  } = useForm<EditPasswordSchema>({
    resolver: zodResolver(editPasswordSchema),
  });
  const role = watchRole('role');

    // Debounce function for search input
    const debouncedFetchData = useCallback(
      debounce(() => {
        fetchData();
      }, 500), // 500 ms debounce delay
      []
    );

  useEffect(() => {
      const parts = pathname.split("/");
      const lastPart = parts[parts.length - 2];
      setI18nName(lastPart);

  
      // Call the debounced fetch function
      debouncedFetchData();
  
      // Cleanup debounce on unmount
      return () => {
        debouncedFetchData.cancel();
      };
    }, [debouncedFetchData]);

  const fetchData = async () => {
      try {
        const response = await axios.get(`/api/users/${params.id}`);
        setUserData(response.data);
        setValue("email", response.data.email);
        setValue("name", response.data.name);
        setValue("role", response.data.role);
        response.data.custNo && setValue("custNo", response.data.custNo);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false); // Data fetching is complete
      }
    };

  if (loading || !t) {
    return (
      <Loading/>
    );
  }

  const onFinish: SubmitHandler<EditAdminSchema> = async (values) => {
    try {
      const response = await axios.put(`/api/users/${params.id}`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      router.replace(`/${locale}/admin/admins`);

      toastSuccess(t("user_updated_successfully"));
    } catch (error: any) {
      toastError(error.response.data.message);
    }
  };

  const onFinishPassword: SubmitHandler<EditPasswordSchema> = async (
    values
  ) => {
    try {
      const response = await axios.put(
        `/api/admin-password/${params.id}`,
        {
          confirmPassword: values.confirmPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      router.replace(`/${locale}/admin/admins`);

      toastSuccess(t("password_updated_successfully"));
    } catch (error: any) {
      toastError(error.response.data.message);
    }
  };
  return (
    <>
      <div className="px-4">
        <div
          className="py-8 pl-8 rounded-lg flex flex-col bg-white"
          style={{ boxShadow: `0px 4px 16px 0px rgba(0, 0, 0, 0.08)` }}
        >
          <div className="text-lg pb-4 default-font flex">
            <Link className="text-comp-sub-header" href={`/${locale}/admin/admins`}>
              {t('staff_setting')}
            </Link>{" "}
            <ChevronRightIcon className="w-4 mx-4" />{" "}
            <p className="font-semibold">{t('edit_staff')}</p>
          </div>
          <div className="flex justify-between">
            <Form
              form={form}
              name="user_form"
              onFinish={handleSubmit(onFinish)}
              layout="vertical"
              className="grow pr-12"
            >
              <span className="login100-form-title font-bold text-black">
                {t('edit_staff')}
              </span>
              <Form.Item
                name="email"
                label={t('email')}
                className="pt-4"
                required
                tooltip={t('this_is_a_required_field')}
                help={errors.email && t('please_enter_a_valid_email')}
                validateStatus={errors.email ? "error" : ""}
              >
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input {...field} placeholder={t('email')} size="large" />
                  )}
                />
              </Form.Item>

              <Form.Item
                name="name"
                label={t('name')}
                required
                tooltip={t('this_is_a_required_field')}
                help={errors.name && t('please_enter_a_name')}
                validateStatus={errors.name ? "error" : ""}
              >
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input {...field} placeholder={t('name')} size="large" />
                  )}
                />
              </Form.Item>

              <Form.Item
                name="role"
                label={t('role')}
                required
                tooltip={t('this_is_a_required_field')}
                help={errors.role && t('please_enter_a_role')}
                validateStatus={errors.role ? "error" : ""}
              >
                <Controller
                  control={control} // control from useForm()
                  name="role"
                  render={({ field }) => (
                    <Select {...field} placeholder={t('select_a_role')} size="large">
                      <Option value="ADMIN">{t('admin')}</Option>
                      <Option value="CLAIM">{t('claim')}</Option>
                      <Option value="SALE">{t('sale')}</Option>
                    </Select>
                  )}
                />
              </Form.Item>
              {/* {role == "SALE" && ( */}
              <Form.Item
                name="custNo"
                label={role == "SALE" ? t('sale_admin') : t('custNo')}
                required
                tooltip={t('this_is_a_required_field')}
                help={errors.name && (role == "SALE" ? t('please_enter_a_sale_admin') : t('please_enter_a_sale_custNo'))}
                validateStatus={errors.name ? "error" : ""}
              >
                <Controller
                  control={control}
                  name="custNo"
                  render={({ field }) => (
                    <Input {...field} value={field.value || ''} placeholder={role == "SALE" ? t('sale_admin') : t('custNo')} size="large" />
                  )}
                />
              </Form.Item>
              {/* )} */}
              <Form.Item className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-comp-red button-backend"
                >
                  {t('submit')}
                </Button>
              </Form.Item>
            </Form>
            <Form
              form={formPassword}
              name="password_form"
              onFinish={handleSubmitPassword(onFinishPassword)}
              layout="vertical"
              className="grow pr-12"
            >
              <span className="login100-form-title font-bold text-black">
                {t('change_password')}
              </span>
              <div className="wrap-input100 pt-4">
                <Form.Item<FieldType>
                  label={t('password')}
                  name="newPassword"
                  help={
                    errorsPassword.newPassword &&
                    t('password_must_be_at_least_6_characters_long')
                  }
                  validateStatus={errorsPassword.newPassword ? "error" : ""}
                >
                  <Controller
                    control={controlPassword}
                    name="newPassword"
                    render={({ field }) => (
                      <Input.Password
                        {...field}
                        prefix={
                          <LockOutlined className="site-form-item-icon" />
                        }
                        type="password"
                        placeholder={t('new_password')}
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              </div>
              <div className="wrap-input100">
                <Form.Item<FieldType>
                  label={t('confirm_password')}
                  name="confirmPassword"
                  help={
                    errorsPassword.confirmPassword && t('passwords_do_not_match')
                  }
                  validateStatus={errorsPassword.confirmPassword ? "error" : ""}
                >
                  <Controller
                    control={controlPassword}
                    name="confirmPassword"
                    render={({ field }) => (
                      <Input.Password
                        {...field}
                        prefix={
                          <LockOutlined className="site-form-item-icon" />
                        }
                        type="password"
                        placeholder={t('confirm_password')}
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              </div>
              <Form.Item className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-comp-red button-backend"
                >
                  {t('submit')}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
