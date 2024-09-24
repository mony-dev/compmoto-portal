import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Form, Input, Modal, Switch, Select } from "antd";
import axios from "axios";
import { useCurrentLocale } from "next-i18n-router/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import tw from "twin.macro";
import i18nConfig from "../../../i18nConfig";
import UploadRewardImage from "../UploadRewardImage";
import { newsSchema, NewsSchema } from "@lib-schemas/user/news-schema";
import { manualSchema, ManualSchema } from "@lib-schemas/user/user-manual-schema";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerManual: (value: boolean) => void;
  manualData?: any;
  triggerManual: boolean;
  mode: string;
  title: string;
  id: number;
  setId: (value: number) => void;
};

interface ManualDataType {
  id: number;
  name: string;
  content: string;
}

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;

const ModalManual = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerManual,
  manualData,
  triggerManual,
  title,
  id,
  mode,
  setId,
}: Props) => {
  const {
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<ManualSchema>({
    resolver: zodResolver(manualSchema),
  });
  const { t } = useTranslation();
  const [triggerMe, setTriggerMe] = useState(false);
  const router = useRouter();
  const [editManualData, setEditManualData] = useState<ManualDataType | null>(null);
  const [coverImg, setCoverImg] = useState<string | { url: string }[]>([]);
  const locale = useCurrentLocale(i18nConfig);

  useEffect(() => {
    const manual = manualData.find((item: { id: number }) => item.id === id);
    if (manual && mode === "EDIT") {
        setEditManualData(manual);
      // Set form values
      setValue("name", manual.name);
      setValue("content", manual.content);
    } else {
      reset({
        name: "",
        content: "",
      });
    }
  }, [manualData, id]);



  const resetForm = () => {
    reset({
      name: "",
      content: "",
    });
    setIsModalVisible(false);
    setId(0);
    setEditManualData(null)
  };

  const onSubmit: SubmitHandler<ManualSchema> = async (values) => {
    if (mode === "EDIT" && editManualData) {
      try {
        const response = await axios.put(
          `/api/adminUserManual/${editManualData.id}`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        resetForm();
        setTriggerManual(!triggerManual);
        setTriggerMe(!triggerMe);
        toastSuccess(t("User_manual_updated_successfully"));
        router.replace(`/${locale}/admin/adminUserManual`);
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      try {
        const response = await axios.post(`/api/adminUserManual`, values, {
          headers: {
            "Content-Type": "application/json"
          },
        });
        resetForm();
        setTriggerManual(!triggerManual);
        setTriggerMe(!triggerMe);
        toastSuccess(t("User_manual_created_successfully"));
        router.replace(`/${locale}/admin/adminUserManual`);
      } catch (error: any) {
        toastError(error.message);
      }
    }
  };

  return (
    <Modal
      title={title}
      open={isModalVisible}
      onCancel={() => resetForm()}
      footer={false}
    >
      <hr className="my-2" />
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        <Form.Item
          name="name"
          label={t("name")}
          required
          tooltip={t("this_is_a_required_field")}
          help={errors.name?.message}
          validateStatus={errors.name ? "error" : ""}
        >
          <Controller
            control={control}
            name="name"
            render={({ field }) => <Input {...field} placeholder={t("name")} />}
          />
        </Form.Item>
        <Form.Item
          name="content"
          label={t("content")}
          required
          tooltip={t("this_is_a_required_field")}
          help={errors.content?.message}
          validateStatus={errors.content ? "error" : ""}
        >
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <ReactQuill
                {...field}
                theme="snow"
                onChange={(value) => field.onChange(value)}
                value={field.value || ""}
                placeholder={t("enter_content")}
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                    ['blockquote', 'code-block'],
                    ['link', 'image', 'video', 'formula'],
                  
                    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                    [{ 'direction': 'rtl' }],                         // text direction
                  
                    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  
                    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                    [{ 'font': [] }],
                    [{ 'align': [] }],
                  
                    ['clean']                                         // remove formatting button
                  ],
                }}
              />
            )}
          />
        </Form.Item>
        {/* Submit Button */}
        <Form.Item className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            className="bg-comp-red button-backend"
          >
            {t("submit")}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalManual;
