import { useState, useEffect } from "react";
import { Modal, Carousel, Image } from "antd";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { CustomArrow } from "@components/CustomArrow";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

interface AlbumDataType {
  key: number;
  id: number;
  name: string;
  images: any;
}

const ShowAlbum = () => {
  const { t } = useTranslation();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      axios
        .get(`/api/adminRewardAlbum`)
        .then((response) => {
          const album = response.data.map((reward: AlbumDataType) => ({
            key: reward.id,
            id: reward.id,
            name: reward.name,
            images: reward.images,
          }));
          setAlbums(album);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });
    };
    fetchAlbums();
  }, []);

  const handleImageClick = (album: any) => {
    setSelectedAlbum(album);
    setCurrentImages(album.images);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAlbum(null);
  };

  return (
    albums.length > 0 && (
      <>
        <h2 className="text-travel text-6xl volkhov-font pb-8">
          {t("Travel, enjoy and live a new and full life")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {albums.map((album: any) => (
            <div key={album.id} className="grid gap-4">
              {album.images.slice(0, 3).map((image: any) => (  // Limit to 3 images per album
                <div  className="relative" key={image.id} style={{ width: '100%', height: '200px', overflow: 'hidden', borderRadius: '1rem' }}>
                  <Image
                    src={image.url}
                    alt={album.name}
                    onClick={() => handleImageClick(album)}
                    className="h-full w-full object-cover cursor-pointer"
                    preview={false}
                    loading="lazy"
                  />
                    <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                    {album.name}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <Modal
          visible={isModalOpen}
          onCancel={handleModalClose}
          footer={null}
          width={700}
          className="show-album bg-comp-gray-bg"
        >
          {selectedAlbum && (
            <Carousel 
            arrows 
            infinite={false}
            prevArrow={<CustomArrow icon={<LeftOutlined />} />}
            nextArrow={<CustomArrow icon={<RightOutlined />} />} // Use custom arrow for next

            >
              {currentImages.map((image: any) => (
                <div key={image.id}>
                  <Image
                    src={image.url}
                    alt={image.id}
                    width="100%"
                    preview={false}
                    loading="lazy"
                  />
                </div>
              ))}
            </Carousel>
          )}
        </Modal>
      </>
    )
  );
};

export default ShowAlbum;
