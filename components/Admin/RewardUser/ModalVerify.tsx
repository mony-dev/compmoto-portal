import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  categorySchema,
  CategorySchema,
} from "@lib-schemas/user/category-schema";
import { rewardUserSchema, RewardUserSchema } from "@lib-schemas/user/reward-user-schema";
import { toastError, toastSuccess } from "@lib-utils/helper";
import { Button, Form, Input, Modal, Space, Switch } from "antd";
import { triggerFocus } from "antd/es/input/Input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styled from "styled-components";
import tw from "twin.macro";

type Props = {
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  setTriggerReward: (value: boolean) => void;
  rewardUserData?: any;
  triggerReward: boolean;
  mode: string;
  title: string;
  id: number;
};

const Hr = styled.hr`
  ${tw`bg-comp-gray-line mx-24`}
`;
const ModalVerify = ({
  isModalVisible,
  setIsModalVisible,
  setTriggerReward,
  rewardUserData,
  triggerReward,
  mode,
  title,
  id,
}: Props) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RewardUserSchema>({
    resolver: zodResolver(rewardUserSchema),
  });
  const [trigger, setTrigger] = useState(false);
  const [verifuData, setVerifyData] = useState(false);


  useEffect(() => {
    // if (mode === 'EDIT' && cateDate && cateDate.id > 0) {
    //   setValue("name", cateDate.name);
    //   setValue("isActive", cateDate.isActive);
    // }
    const verify = rewardUserData.filter((item: { id: number; }) => item.id === id)
    console.log(verify[0]?.user.custNo)
    setVerifyData(verify);
    setValue("custNo", verify[0]?.user.custNo);
  }, [rewardUserData, trigger, id]);

//   const onSubmit: SubmitHandler<CategorySchema> = async (values) => {
//     if(mode === 'EDIT' && cateDate && cateDate.id > 0) {
//       try {
//         const response = await axios.put(`/api/rewardCategories/${cateDate.id}`, values, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });
//         setIsModalVisible(false);
//         toastSuccess("Category updated successfully");
//         router.replace("/admin/adminRewardCategory");
//       } catch (error: any) {
//         toastError(error.message);
//       }
//     } else {
//       try {
//         const response = await axios.post(`/api/rewardCategories`, values, {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });
//         setIsModalVisible(false);
//         toastSuccess("Category created successfully");
//         router.replace("/admin/adminRewardCategory");
//       } catch (error: any) {
//         toastError(error.message);
//       }
//     }
//     setValue("name", "");
//     setValue("isActive", false);
//     setTriggerCategory(!triggerCategory);
//     setTrigger(!trigger)
//   };

  return (
    <>
      <Modal
        title={title}
        open={isModalVisible}
        // onOk={false}
        onCancel={() => {
        //   setIsModalVisible(false);
        //   setValue("name", "");
        //   setValue("isActive", false);
        //   setTrigger(!trigger)
        }}
        footer={false}
      >
        <div className="flex justify-between">
          <Form
            form={form}
            name="form"
            // onFinish={handleSubmit(onSubmit)}
            layout="inline"
            className="grow"
          >
            {/* <Form.Item
              name="custNo"
              label="รหัสลูกค้า"
            >
           <Controller
                control={control}
                name="custNo"
                render={({ field }) => (
                  <Input {...field} placeholder="Name" />
                )}
              />
            </Form.Item> */}
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default ModalVerify;
