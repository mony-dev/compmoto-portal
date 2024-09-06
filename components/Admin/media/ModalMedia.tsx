import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@lib-utils/helper";
import {
  Button,
  Form,
  Input,
  Modal,
  Switch,
  Select,
  Checkbox,
  Radio,
  RadioChangeEvent,
} from "antd";
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
import { mediaSchema, MediaSchema } from "@lib-schemas/user/media-schema";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerMedia: (value: boolean) => void;
  mediaData?: any;
  triggerMedia: boolean;
  mode: string;
  title: string;
  id: number;
  setId: (value: number) => void;
  minisizeOptions: { value: string; label: string }[];
};

interface MediaDataType {
  id: number;
  name: string;
  isActive: boolean;
  minisizeId: number;
  coverImg?: string;
  url: string;
  type: string;
  duration?: string;
}

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;

const ModalMedia = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerMedia,
  mediaData,
  triggerMedia,
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
  } = useForm<MediaSchema>({
    resolver: zodResolver(mediaSchema),
  });
  const { t } = useTranslation();
  const [triggerMe, setTriggerMe] = useState(false);
  const router = useRouter();
  const [editMediaData, setEditMediaData] = useState<MediaDataType | null>(
    null
  );
  const [coverImg, setCoverImg] = useState<string | { url: string }[]>([]);
  const locale = useCurrentLocale(i18nConfig);
  const [type, setType] = useState<"File" | "Video" | "Image">("Video");

  const options = [
    { label: t("video"), value: "Video" },
    { label: t("image"), value: "Image" },
    { label: t("pdf file"), value: "File" },
  ];

  useEffect(() => {
    const media = mediaData.find((item: { id: number }) => item.id === id);
    if (media && mode === "EDIT") {
      setEditMediaData(media);
      // Set form values
      setType(media.type);
      setValue("type", media.type);
      setValue("name", media.name);
      setValue("isActive", media.isActive);
      setValue("minisizeId", media.minisizeId);
      setValue("url", media.url);
      setValue("coverImg", media.coverImg);
      setValue("duration", media.duration);
      setCoverImg(media?.coverImg);
    } else {
      setCoverImg("");
      setType("Video");
      reset({
        name: "",
        type: "Video",
        isActive: true,
        minisizeId: undefined,
        url: "",
        coverImg: "",
        duration: "",
      });
    }
  }, [mediaData, id]);

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
      type: "Video",
      isActive: true,
      minisizeId: undefined,
      url: "",
      coverImg: "",
      duration: "",
    });
    setIsModalVisible(false);
    setId(0);
  };

  const onSubmit: SubmitHandler<MediaSchema> = async (values) => {
    if (mode === "EDIT" && editMediaData) {
      try {
        const response = await axios.put(
          `/api/adminMedia/${editMediaData.id}`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        resetForm();
        setTriggerMedia(!triggerMedia);
        setTriggerMe(!triggerMe);
        toastSuccess(t("Media_updated_successfully"));
        router.replace(`/${locale}/admin/adminMedia`);
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      try {
        const response = await axios.post(`/api/adminMedia`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        resetForm();
        setTriggerMedia(!triggerMedia);
        setTriggerMe(!triggerMe);
        toastSuccess(t("media_created_successfully"));
        router.replace(`/${locale}/admin/adminMedia`);
      } catch (error: any) {
        toastError(error.message);
      }
    }
  };

  const onChangeType = (e: RadioChangeEvent) => {
    const selectedType = e.target.value;
    setType(selectedType);
    setValue("type", selectedType);
    setCoverImg("");
    // Reset specific fields based on the selected type
    if (selectedType === "Video") {
      setValue("coverImg", "");
    } else {
      setValue("coverImg", "");
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
        {/* Type Radio */}
        <Form.Item
          name="type"
          required
          tooltip={t("this_is_a_required_field")}
          help={errors.type?.message}
          validateStatus={errors.type ? "error" : ""}
        >
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Radio.Group
                options={options}
                onChange={onChangeType}
                value={type}
                optionType="button"
              />
            )}
          />
        </Form.Item>

        {/* Common Fields */}
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

        {/* Conditional Fields */}
        {type === "Video" && (
          <>
            <Form.Item
              name="url"
              label={t("url")}
              required
              tooltip={t("this_is_a_required_field")}
              help={errors.url?.message}
              validateStatus={errors.url ? "error" : ""}
            >
              <Controller
                control={control}
                name="url"
                render={({ field }) => (
                  <Input {...field} placeholder={t("url")} />
                )}
              />
            </Form.Item>
            <Form.Item
              name="duration"
              label={t("duration")}
              required
              tooltip={t("this_is_a_required_field")}
              help={errors.duration?.message}
              validateStatus={errors.duration ? "error" : ""}
            >
              <Controller
                control={control}
                name="duration"
                render={({ field }) => (
                  <>
                    <p className="text-comp-red	pb-2 text-xs">{t("Please fill in the values following the example format shown")}</p>
                    <Input {...field} placeholder={t("duration")} />
                  </>
                )}
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="coverImg"
          label={
            type === "Image"
              ? t("image")
              : type === "Video"
              ? t("cover image")
              : t("file")
          }
          required
          tooltip={t("this_is_a_required_field")}
          help={errors.coverImg?.message}
          validateStatus={errors.coverImg ? "error" : ""}
        >
          <Controller
            control={control}
            name="coverImg"
            render={({ field }) =>
              type === "File" ? (
                <><UploadRewardImage
                  setFile={setCoverImg}
                  fileType="auto"
                  allowType={["pdf"]}
                  initialImage={coverImg}
                  multiple={false}
                  id={editMediaData?.id} /></>
              ) : (
                <UploadRewardImage
                  setImage={setCoverImg}
                  fileType="image"
                  allowType={["jpg", "png", "jpeg"]}
                  initialImage={coverImg}
                  multiple={false}
                  id={editMediaData?.id}
                />
              )
            }
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

export default ModalMedia;
