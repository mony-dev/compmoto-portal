"use client";
import {
  CheckIcon,
  PaperClipIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { rewardSchema, RewardSchema } from "@lib-schemas/user/reward-schema";
import { toastError, toastSuccess } from "@lib-utils/helper";
import {
  Button,
  Col,
  DatePicker,
  DatePickerProps,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Switch,
  Upload,
} from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styled from "styled-components";
import tw from "twin.macro";
import UploadRewardImage from "../UploadRewardImage";
import DatePickers from "../DatePickers";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerReward: (value: boolean) => void;
  reData?: {
    name: string;
    id: number;
    point: number;
    startDate: string;
    endDate: string;
    image: string;
    file: string;
  };
  triggerReward: boolean;
  mode: string;
  id: number;
  title: string;
};

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;
const ModalReward = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerReward,
  reData,
  triggerReward,
  mode,
  id,
  title,
}: Props) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RewardSchema>({
    resolver: zodResolver(rewardSchema),
  });

  const [triggera, setTriggera] = useState(false);
  const [image, setImage] = useState<string | { url: string }[]>([]);
  const [file, setFile] = useState<string>();

  useEffect(() => {
    if (mode === "EDIT" && reData && reData.id > 0) {
      setValue("name", reData.name);
      setValue("point", reData.point);
      setValue("startDate", reData.startDate);
      setValue("endDate", reData.endDate);
      setValue("file", reData.file);
      setValue("image", reData.image);
      setImage(reData?.image);
      setFile(reData?.file);
    } else {
      setValue("name", "");
      setValue("point", 0);
      setValue("startDate", "");
      setValue("endDate", "");
      setValue("file", "");
      setValue("image", "");
      setImage("");
      setFile("");
    }
  }, [trigger, reData, mode]);


  useEffect(() => {
    let effFile = ""
    let effImage:any = ""
    if (file) {
      effFile = file
    } 
    if (image) {
      effImage = image
    } 
    setValue("file", effFile);
    setValue("image", effImage);
    mode == "EDIT" &&  trigger(["file", "image"]);
  }, [file, image]);

  const onSubmit: SubmitHandler<RewardSchema> = async (values) => {
    if (mode === "EDIT" && reData && reData.id > 0) {
      try {
        const response = await axios.put(
          `/api/reward/${reData.id}`,
          {
            name: values.name,
            startDate: values.startDate,
            endDate: values.endDate,
            point: values.point,
            image: image,
            file: file,
            rewardCategoryId: id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setIsModalVisible(false);
        toastSuccess("Category updated successfully");
        // router.replace("/admin/adminRewardCategory");
      } catch (error: any) {
        toastError(error.message);
      }
    } else {
      try {
        const rewardResponse = await axios.post(
          `/api/reward`,
          {
            name: values.name,
            startDate: values.startDate,
            endDate: values.endDate,
            point: values.point,
            image: image,
            file: file,
            rewardCategoryId: id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setIsModalVisible(false);
        toastSuccess("Category reward successfully");
        // router.replace("/admin/adminRewardCategory");
      } catch (error: any) {
        toastError(error.message);
      }
    }
    setTriggerReward(!triggerReward);
    setTriggera(!triggera);
  };

  return (
    <>
      <Modal
        title={title}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setTriggera(!triggera);
          setTriggerReward(!triggerReward);
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
            name="image"
            label="Upload Image"
            required
            tooltip="This is a required field"
            help={errors.image && "Please upload reward image"}
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
          <Form.Item
            name="point"
            label="Point"
            required
            tooltip="This is a required field"
            help={errors.point && "Please enter reward point"}
            validateStatus={errors.point ? "error" : ""}
          >
            <Controller
              control={control}
              name="point"
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  size="large"
                  className="w-full"
                />
              )}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                required
                tooltip="This is a required field"
              >
                <DatePickers
                  placeholder="Start Date"
                  name="startDate"
                  control={control}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="End Date"
                required
                tooltip="This is a required field"
              >
                <DatePickers
                  placeholder="End Date"
                  name="endDate"
                  control={control}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="file"
            label="Upload File"
            required
            tooltip="This is a required field"
            help={errors.file && "Please upload reward file"}
            validateStatus={errors.file ? "error" : ""}
          >
            <Controller
              control={control}
              name="file"
              render={({ field }) => (
                <UploadRewardImage
                  setFile={setFile}
                  fileType="auto"
                  allowType={["pdf"]}
                  initialImage={file}
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
    </>
  );
};

export default ModalReward;
