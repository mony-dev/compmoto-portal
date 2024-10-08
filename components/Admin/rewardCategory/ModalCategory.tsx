import { zodResolver } from "@hookform/resolvers/zod";
import {
  categorySchema,
  CategorySchema,
} from "@lib-schemas/user/category-schema";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Form, Input, Modal, Switch } from "antd";
import axios from "axios";
import { useCurrentLocale } from "next-i18n-router/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styled from "styled-components";
import tw from "twin.macro";
import i18nConfig from "../../../i18nConfig";
import { useTranslation } from "react-i18next";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerCategory: (value: boolean) => void;
  cateDate?: { name: string; isActive: boolean; id: number };
  triggerCategory: boolean;
  mode: string;
  title: string;
};
const locale = useCurrentLocale(i18nConfig);

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;
const ModalCategory = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerCategory,
  cateDate,
  triggerCategory,
  mode,
  title,
}: Props) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
  });
  const { t } = useTranslation();
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (mode === 'EDIT' && cateDate && cateDate.id > 0) {
      setValue("name", cateDate.name);
      setValue("isActive", cateDate.isActive);
    }
  }, [cateDate, trigger]);

  const onSubmit: SubmitHandler<CategorySchema> = async (values) => {
    if(mode === 'EDIT' && cateDate && cateDate.id > 0) {
      try {
        const response = await axios.put(`/api/rewardCategories/${cateDate.id}`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setIsModalVisible(false);
        toastSuccess(t("Category updated successfully"));
        router.replace(`/${locale}/admin/adminRewardCategory`);
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      try {
        const response = await axios.post(`/api/rewardCategories`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setIsModalVisible(false);
        toastSuccess(t("Category created successfully"));
        router.replace(`/${locale}/admin/adminRewardCategory`);
      } catch (error: any) {
        toastError(error.message);
      }
    }
    setValue("name", "");
    setValue("isActive", false);
    setTriggerCategory(!triggerCategory);
    setTrigger(!trigger)
  };

  return (
    <>
      <Modal
        title={title}
        open={isModalVisible}
        // onOk={false}
        onCancel={() => {
          setIsModalVisible(false);
          setValue("name", "");
          setValue("isActive", false);
          setTrigger(!trigger)
        }}
        footer={false}
      >
        <div className="flex justify-between">
          <Form
            form={form}
            name="form"
            onFinish={handleSubmit(onSubmit)}
            layout="vertical"
            className="grow"
          >
            <Form.Item
              name="name"
              label={t("Name")}
              required
              tooltip={t("This is a required field")}
              help={errors.name && t("Please enter category name")}
              validateStatus={errors.name ? "error" : ""}
            >
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input {...field} placeholder={t("Name")} size="large" />
                )}
              />
            </Form.Item>
            <Form.Item name="isActive" label={t("Active")} className="switch-backend">
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Switch
                    {...field}
                    checkedChildren={t("Active")}
                    unCheckedChildren={t("Inactive")}
                    defaultChecked
                  />
                )}
              />
            </Form.Item>
            <Form.Item className="flex justify-end">
              <Button
                type="primary"
                htmlType="submit"
                className="bg-comp-red button-backend"
              >
                {t("Submit")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default ModalCategory;
