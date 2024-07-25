import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { Upload, message, Button } from "antd";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Image } from "antd";
import { PaperClipIcon, TrashIcon } from "@heroicons/react/24/outline";
import { string } from "zod";

export type ImageData = string | { url: string }[];

// const NavBar = ({ onToggle, isOpen, userData }: NavBarProps) => {
type imageProps = {
  setImage?: Dispatch<SetStateAction<ImageData>>;
  setFile?: (value: string) => void;
  fileType: string;
  allowType: string[];
  initialImage?: string | { url: string }[] | null;
  multiple: boolean;
  id?: number;
};

const UploadRewardImage = ({
  setImage,
  setFile,
  fileType,
  allowType,
  initialImage,
  multiple,
  id,
}: imageProps) => {
  const [imageUrl, setImageUrl] = useState<string | { url: string }[] | null>();
  const [uploadedImageInfo, setUploadedImageInfo] = useState<CloudinaryUploadWidgetInfo | null>(null);
  useEffect(() => {
    if (typeof initialImage === "string") {
      setImageUrl(initialImage);
    }
  }, [initialImage]);

  const afterDelete = () => {
    setImageUrl(null);
    setFile && setFile("");
    setImage && setImage("");
  };

  useEffect(() => {
    if (uploadedImageInfo) {
      const newImageUrl = uploadedImageInfo.secure_url;
      // Check if multiple uploads are allowed
      if (multiple) {
        // If setImage is provided, update the state accordingly
        if (setImage) {
          setImage((prevImage) => {
            // If prevImage is an array, add the new URL object to it
            // Otherwise, create a new array with the new URL object
            let img = Array.isArray(prevImage)
              ? [...prevImage, { url: newImageUrl, rewardAlbumId: id }]
              : prevImage
              ? [{ url: prevImage }, { url: newImageUrl, rewardAlbumId: id }]
              : [{ url: newImageUrl, rewardAlbumId: id }];
            setImageUrl(img);
            return img;
          });
        }
      } else {
        if (setImage) {
          setImage(newImageUrl);
          setImageUrl(newImageUrl);
        }
        if (setFile) {
          setFile(newImageUrl);
        }
      }
    }
  }, [uploadedImageInfo]);

  return (
    <CldUploadWidget
      signatureEndpoint="/api/upload"
      options={{
        sources: ["local"],
        resourceType: fileType,
        clientAllowedFormats: allowType,
      }}
      onUpload={({ info }) => {
        if (typeof info === "object" && "secure_url" in info) {
          setUploadedImageInfo(info);
        }
      }}
    >
      {({ open }) => (
        <>
          <div>
            {(!imageUrl || Array.isArray(imageUrl)) && (
              <Button onClick={() => open()}>Click to upload</Button>
            )}
          </div>
          {imageUrl && !Array.isArray(imageUrl) && (
            <div className="border border-comp-gray-layout rounded-xl flex justify-between items-center p-1">
              <div className="w-7/12">
                <Image.PreviewGroup items={[imageUrl]}>
                  {fileType == "auto" ? (
                    <div className="flex">
                      <div className="ant-upload-icon">
                        <PaperClipIcon className="w-4 pr-1" />
                      </div>
                      <p className="whitespace-nowrap w-7/12 overflow-hidden text-ellipsis">
                        {imageUrl}
                      </p>
                    </div>
                  ) : (
                    <Image
                      className="p-1"
                      alt="Uploaded"
                      width={100}
                      src={imageUrl}
                    />
                  )}
                </Image.PreviewGroup>
              </div>
              <div>
                <TrashIcon
                  className="w-8 text-comp-gray-layout hover:text-comp-red cursor-pointer"
                  onClick={() => afterDelete()}
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
