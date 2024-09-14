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

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerNews: (value: boolean) => void;
  newsData?: any;
  triggerNews: boolean;
  mode: string;
  title: string;
  id: number;
  setId: (value: number) => void;
  minisizeOptions: { value: string; label: string }[];
};

interface NewsDataType {
  id: number;
  name: string;
  isActive: boolean;
  minisizeId: number;
  coverImg?: string;
  content: string;
}

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;

const ModalNews = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerNews,
  newsData,
  triggerNews,
  title,
  id,
  mode,
  setId,
  minisizeOptions,
}: Props) => {
  const {
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<NewsSchema>({
    resolver: zodResolver(newsSchema),
  });
  const { t } = useTranslation();
  const [triggerMe, setTriggerMe] = useState(false);
  const router = useRouter();
  const [editNewsData, setEditNewsData] = useState<NewsDataType | null>(null);
  const [coverImg, setCoverImg] = useState<string | { url: string }[]>([]);
  const locale = useCurrentLocale(i18nConfig);

  useEffect(() => {
    const news = newsData.find((item: { id: number }) => item.id === id);
    if (news && mode === "EDIT") {
      setEditNewsData(news);
      // Set form values
      setValue("name", news.name);
      setValue("isActive", news.isActive);
      setValue("minisizeId", news.minisizeId);
      setValue("coverImg", news.coverImg);
      setValue("content", news.content);
      setCoverImg(news?.coverImg);
    } else {
      setCoverImg("");
      reset({
        name: "",
        isActive: true,
        minisizeId: undefined,
        content: "",
        coverImg: "",
      });
    }
  }, [newsData, id]);

  useEffect(() => {
    let effImage: any = "";

    if (coverImg) {
      effImage = coverImg;
    }
    setValue("coverImg", effImage);
    mode == "EDIT" && trigger(["coverImg"]);
  }, [coverImg]);

  const resetForm = () => {
    reset({
      name: "",
      isActive: true,
      minisizeId: undefined,
      content: "",
      coverImg: "",
    });
    setIsModalVisible(false);
    setId(0);
    setEditNewsData(null)
  };

  const onSubmit: SubmitHandler<NewsSchema> = async (values) => {
    if (mode === "EDIT" && editNewsData) {
      try {
        const response = await axios.put(
          `/api/adminNews/${editNewsData.id}`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        resetForm();
        setTriggerNews(!triggerNews);
        setTriggerMe(!triggerMe);
        toastSuccess(t("News_updated_successfully"));
        router.replace(`/${locale}/admin/adminNews`);
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      try {
        const response = await axios.post(`/api/adminNews`, values, {
          headers: {
            "Content-Type": "application/json",
            maxContentLength: 50 * 1024 * 1024, // 50 MB
            maxBodyLength: 50 * 1024 * 1024,    // 50 MB
          },
        });
        resetForm();
        setTriggerNews(!triggerNews);
        setTriggerMe(!triggerMe);
        toastSuccess(t("news_created_successfully"));
        router.replace(`/${locale}/admin/adminNews`);
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
          name="minisizeId"
          label={t("minisize")}
          required
          tooltip={t("this_is_a_required_field")}
          help={errors.minisizeId?.message}
          validateStatus={errors.minisizeId ? "error" : ""}
        >
          <Controller
            control={control}
            name="minisizeId"
            render={({ field }) => (
              <Select
                {...field}
                showSearch
                placeholder={t("select_a_minisize")}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={minisizeOptions}
              />
            )}
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
                placeholder={t("enter_news_content")}
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
        <Form.Item
          name="coverImg"
          label={t("cover image")}
          required
          tooltip={t("this_is_a_required_field")}
          help={errors.coverImg?.message}
          validateStatus={errors.coverImg ? "error" : ""}
        >
          <Controller
            control={control}
            name="coverImg"
            render={({ field }) => (
              <UploadRewardImage
                setImage={setCoverImg}
                fileType="image"
                allowType={["jpg", "png", "jpeg"]}
                initialImage={coverImg}
                multiple={false}
                id={editNewsData?.id}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label={t("show")}
          className="switch-backend basis-1/2 pl-2"
        >
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch
                {...field}
                checkedChildren={t("active")}
                unCheckedChildren={t("inactive")}
                defaultChecked
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

export default ModalNews;
