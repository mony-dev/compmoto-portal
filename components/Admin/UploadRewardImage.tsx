import { CldUploadWidget } from "next-cloudinary";
import { Upload, message, Button } from "antd";
import React, { useEffect, useState } from "react";
import { Image } from "antd";
import { PaperClipIcon, TrashIcon } from "@heroicons/react/24/outline";
import { string } from "zod";

// const NavBar = ({ onToggle, isOpen, userData }: NavBarProps) => {
type imageProps = {
  setImage?: (value: string) => void;
  setFile?: (value: string) => void;
  fileType: string;
  allowType:string[];
  initialImage?: string | null;
};

const UploadRewardImage = ({ setImage, setFile, fileType, allowType, initialImage }: imageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>();
  useEffect(() => {
    if (initialImage) {
      setImageUrl(initialImage)
    }
  }, [initialImage]);

  return (
    <CldUploadWidget
      signatureEndpoint="/api/upload"
      options={{ sources: ["local"], resourceType: fileType, clientAllowedFormats:  allowType}}
      onUpload={({ info }) => {
        if (typeof info === "object" && "secure_url" in info) {
          setImageUrl(info.secure_url);
          if (setImage) {
            setImage(info.secure_url);
          }
          if (setFile) {
            setFile(info.secure_url);
          }
        }
      }}
    >
      {({ open }) => (
        <>
          <div>
            {!imageUrl && (
              <Button onClick={() => open()}>Click to upload</Button>
            )}
          </div>
          {imageUrl && (
            <div className="border border-comp-gray-layout rounded-xl flex justify-between items-center p-1">
              <div className="w-7/12">
                <Image.PreviewGroup items={[imageUrl]}>
                  {fileType == 'auto' ? 
                  <div className="flex">
                    <div className="ant-upload-icon">
                    <PaperClipIcon className="w-4 pr-1"/>
                    </div>
                    <p className="whitespace-nowrap w-7/12 overflow-hidden text-ellipsis">{imageUrl}</p>
                  </div>
                   :  <Image
                    className="p-1"
                    alt="Uploaded"
                    width={100}
                    src={imageUrl}
                  />}
                 
                </Image.PreviewGroup>
              </div>
              <div>
                <TrashIcon
                  className="w-8 text-comp-gray-layout hover:text-comp-red cursor-pointer"
                  onClick={() => setImageUrl(null)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </CldUploadWidget>
  );
};

export default UploadRewardImage;
