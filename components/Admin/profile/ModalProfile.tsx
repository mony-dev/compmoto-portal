import { zodResolver } from "@hookform/resolvers/zod";
import {
  formatDate,
  formatDateRange,
  toastError,
  toastSuccess,
} from "@lib-utils/helper";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Tooltip,
  Image,
  Select,
  Checkbox,
  InputNumber,
  Row,
  Col,
} from "antd";
import axios from "axios";
import { useCurrentLocale } from "next-i18n-router/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Controller,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import tw from "twin.macro";
import i18nConfig from "../../../i18nConfig";
import { SizeType } from "antd/es/config-provider/SizeContext";
import UploadRewardImage from "../UploadRewardImage";
import { profileSchema, ProfileSchema } from "@lib-schemas/user/profile-schema";
import { useSession } from "next-auth/react";
import { useCart } from "../Cartcontext";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerProfile: (value: boolean) => void;
  triggerProfile: boolean;
  title: string;
  user: any;
};

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;

const ModalProfile = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerProfile,
  triggerProfile,
  title,
  user,
}: Props) => {
  const {
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
  });
  const { data: session, status } = useSession();

  const [triggerPro, setTriggerPro] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const locale = useCurrentLocale(i18nConfig);
  const [image, setImage] = useState<string | { url: string }[]>([]);
  const { profileImage, setProfileImage } = useCart();

  useEffect(() => {
    if (user && user.image) {
      setImage(user.image); 
      reset({ image: user.image }); 
    }
  }, [user, reset]);

  useEffect(() => {
    let effImage: any = "";

    if (image) {
      effImage = image;
    }
    setValue("image", effImage);
  }, [image]);

  const resetForm = () => {
    setIsModalVisible(false);
  };

  const onSubmit: SubmitHandler<ProfileSchema> = async (values) => {
    try {
      const response = await axios.put(
        `/api/updateProfile/${session?.user.id}`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setProfileImage(values.image);
      setTriggerProfile(!triggerProfile);
      setTriggerPro(!triggerPro);
      setIsModalVisible(false);
      toastSuccess("Profile updated successfully");
      router.replace(`/${locale}/admin/dashboards`);
    } catch (error: any) {
      toastError(error.message);
    }
  };
  return (
    <Modal
      title={title}
      open={isModalVisible}
      onCancel={() => resetForm()}
      footer={false}
    >
      <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
        <Form.Item
          name="image"
          label="Upload Image"
          required
          tooltip="This is a required field"
          help={errors.image && "Please upload profile image"}
          validateStatus={errors.image ? "error" : ""}
        >
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <UploadRewardImage
                setImage={setImage}
                fileType="image"
                allowType={["jpg", "png", "jpeg"]}
                initialImage={image}
                multiple={false}
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
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalProfile;
