"use client";

import { useRouter } from "next/navigation";
import { Form, Input, Button, Select } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { LockOutlined } from "@ant-design/icons";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { AdminSchema, adminSchema } from "@lib-schemas/user/admin-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { useSession } from "next-auth/react";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../../../../../../../i18nConfig";
import { useTranslation } from "react-i18next";

export default function Admin({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { Option } = Select;
  const [form] = Form.useForm();
  const locale = useCurrentLocale(i18nConfig);

  type FieldType = {
    currentPassword: string;
    confirmPassword: string;
    newPassword: string;
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch: watchRole,
  } = useForm<AdminSchema>({
    resolver: zodResolver(adminSchema),
  });

  const role = watchRole("role");

  const onFinish: SubmitHandler<AdminSchema> = async (values) => {
    const response = await axios
      .post(`/api/users`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        toastSuccess("User created successfully");
        router.replace(`/${locale}/admin/admins`);
      })
      .catch((error) => {
        toastError(error);
      });
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
            <p className="">{t('add_staff')}</p>
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
                {t('add_staff')}
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
                    <Input {...field} placeholder="Email" size="large" />
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
                    <Input {...field} placeholder="Name" size="large" />
                  )}
                />
              </Form.Item>

              <Form.Item
                name="role"
                label="Role"
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
              {role == "SALE" ? (
                <Form.Item
                  name="custNo"
                  label={t('sale_admin')}
                  required
                  tooltip={t('this_is_a_required_field')}
                  help={errors.role && t('please_enter_a_sale_admin')}
                  validateStatus={errors.role ? "error" : ""}
                >
                  <Controller
                    control={control}
                    name="custNo"
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder={t('sale_admin')}
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="custNo"
                  label={t('custNo')}
                  required
                  tooltip={t('this_is_a_required_field')}
                  help={errors.role && t('please_enter_a_custNo')}
                  validateStatus={errors.role ? "error" : ""}
                >
                  <Controller
                    control={control}
                    name="custNo"
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder={t('custNo')}
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              )}
              <div className="wrap-input100">
                <Form.Item<FieldType>
                  label={t('password')}
                  name="newPassword"
                  help={
                    errors.newPassword &&
                    t('password_must_be_at_least_6_characters_long')
                  }
                  validateStatus={errors.newPassword ? "error" : ""}
                >
                  <Controller
                    control={control}
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
                  help={errors.confirmPassword && t('passwords_do_not_match')}
                  validateStatus={errors.confirmPassword ? "error" : ""}
                >
                  <Controller
                    control={control}
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
