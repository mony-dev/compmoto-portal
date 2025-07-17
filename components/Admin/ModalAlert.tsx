import {
  Modal,
  Alert,
} from "antd";
import { useEffect, useState } from "react";

type Props = {
    setIsAllowed: (value: boolean) => void;
    isAllowed: boolean;
    setIsModalVisible: (value: boolean) => void;
    message: string;
    description: string;
    resetMainForm: () => void;
    setIsAlert: (value: boolean) => void;
    isAlert: boolean;
    setTotalPurchaseActive?: (value: { id: "", name: "" }) => void;
    setSpecialBonusActive?: (value: { id: "", name: "" }) => void;

  };

const ModalAlert = ({
    setIsAllowed,
    isAllowed,
    message,
    description,
    setIsAlert,
    isAlert,
    setTotalPurchaseActive,
    setSpecialBonusActive
  }: Props) => {
    

  const resetForm = () => {
    setIsAllowed(false);
    if (setTotalPurchaseActive) {
      setTotalPurchaseActive({ id: "", name: "" });
    }
    if (setSpecialBonusActive) {
      setSpecialBonusActive({ id: "", name: "" });
    }
  };

  useEffect(() => {
    
    if (isAllowed) {
      setIsAlert(true);
    } else {
      setIsAlert(false);
    }
  }, [isAllowed]);

  // useEffect(() => {
  //   setIsAlert(isAllowed);
  // }, [isAllowed]);

  return (
    <Modal
        title={false}
        open={isAllowed && isAlert}
        onCancel={() => resetForm()}
        footer={false}
        centered={true}
        className="p-0"
    >
        <Alert
            message={message}
            description={description}
            type="error"
            showIcon
        />
    </Modal>
  );
};

export default ModalAlert;
