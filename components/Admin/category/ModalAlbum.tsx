"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { rewardSchema, RewardSchema } from "@lib-schemas/user/reward-schema";
import { toastError, toastSuccess } from "@lib-utils/helper";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
} from "antd";
import axios from "axios";
import { Key, SetStateAction, useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styled from "styled-components";
import tw from "twin.macro";
import UploadRewardImage from "../UploadRewardImage";
import { Image } from "antd";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { AlbumSchema, albumSchema } from "@lib-schemas/user/album-schema";
import { useRouter } from "next/navigation";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerAlbum: (value: boolean) => void;
  alData?: {
    id: number;
    name: string;
    images: any;
  };
  triggerAlbum: boolean;
  mode: string;
  id: number;
  title: string;
};

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;
const ModalAlbum = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerAlbum,
  alData,
  triggerAlbum,
  mode,
  id,
  title,
}: Props) => {
  const [form] = Form.useForm();
  const {
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<AlbumSchema>({
    resolver: zodResolver(albumSchema),
  });

  const [triggerAction, setTriggerAction] = useState(false);
  const [image, setImage] = useState<string | { url: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (mode === "EDIT" && alData && alData.id > 0) {
      setValue("name", alData.name);
      setImage(alData?.images);
    } else {
      setValue("name", "");
      setImage([]);
    }
  }, [trigger, alData, mode]);

  // useEffect(() => {
    
  //   setValue("image", image);
  // }, [image]);
  const handleDelete = (index: number) => {
    setImage((prevImage) => {
      const arrayImage = Array.isArray(prevImage) ? prevImage : [];
      const updatedImages = arrayImage.filter((_, i) => i !== index);
      return updatedImages;
    });
    setVisiblePreviewIndex(null);
  };

    const [visiblePreviewIndex, setVisiblePreviewIndex] = useState(null);
    const handlePreview = (index: any) => {
    setVisiblePreviewIndex(index);
    };

    const handleClosePreview = () => {
    setVisiblePreviewIndex(null); 
    };

  const onSubmit: SubmitHandler<AlbumSchema> = async (values) => {
    if (mode === "EDIT" && alData && alData.id > 0) {
      try {
        const response = await axios.put(
          `/api/adminRewardAlbum/${alData.id}`,
          {
            name: values.name,
            image: image,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setIsModalVisible(false);
        setTriggerAlbum(!triggerAlbum);
        toastSuccess("Album updated successfully");
        // router.replace("/admin/adminRewardCategory");
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      try {
        const response = await axios.post(
          `/api/adminRewardAlbum`,
          {
            name: values.name,
            image: image,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setIsModalVisible(false);
        setTriggerAlbum(!triggerAlbum);
        toastSuccess("Album reward successfully");
      } catch (error: any) {
        toastError(error.message);
      }
    }
    setTriggerAlbum(!triggerAlbum);
    setTriggerAction(!triggerAction);
  };

  return (
    <>
      <Modal
        title={title}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setTriggerAction(!triggerAction);
          setTriggerAlbum(!triggerAlbum);
        }}
        footer={false}
      >
        <Form
          form={form}
          name="form"
          onFinish={handleSubmit(onSubmit)}
          layout="vertical"
          className="reward-modal"
        >
          <Form.Item
            name="name"
            label="Name"
            required
            tooltip="This is a required field"
            help={errors.name && "Please enter reward name"}
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
         
          <hr className="pb-4"></hr>
          <Form.Item
            name="image"
            label="Upload Image"
            // required
            // tooltip="This is a required field"
            // help={errors.image && "Please upload reward image"}
            // validateStatus={errors.image ? "error" : ""}
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
                  multiple={true}
                  id={alData?.id}
                />
              )}
            />
          </Form.Item>
          <div className="flex flex-wrap">
            {Array.isArray(image) &&
              image.map((albumItem, index) => (
                <div key={index} className="m-2">
                  <Image
                    className="border border-comp-gray-layout rounded-xl"
                    alt="reward album"
                    width={80}
                    height={80}
                    src={albumItem.url}
                    preview={{
                        visible: visiblePreviewIndex === index, // Show preview based on index
                        onVisibleChange: (vis) => {
                          if (!vis) handleClosePreview(); // Close preview when visibility changes to false
                        },
                        mask: (
                          <>
                            <EyeIcon className="w-6" style={{ color: "white" }} onClick={() => handlePreview(index)} />
                            <TrashIcon className="w-6" style={{ color: "white" }} onClick={() => handleDelete(index)} />
                          </>
                        ),
                      }}
                  />
                </div>
              ))}
          </div>
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
    </>
  );
};

export default ModalAlbum;
