import { useState, useEffect } from "react";
import { Modal, Carousel, Image } from "antd";
import axios from "axios";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "../../i18nConfig";
import { useTranslation } from "react-i18next";
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

  const getRandomImage = (images: []) => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

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
    <>
      <h2 className="text-travel text-6xl volkhov-font">
        {t("Travel, enjoy and live a new and full life")}
      </h2>
      <div className="grid gap-4 grid-cols-3">
        {albums.map((album: any) => {
          const randomImage: any = getRandomImage(album.images);
          return (
            <div key={album.id} className="relative pt-4">
              <Image
                src={randomImage.url}
                alt={album.name}
                onClick={() => handleImageClick(album)}
                className="cursor-pointer rounded-lg"
                width={300}
                height={300}
                preview={false}
                style={{ objectFit: "cover" }}
                 loading="lazy"
              />
              <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                {album.name}
              </div>
            </div>
          );
        })}

        <Modal
          visible={isModalOpen}
          onCancel={handleModalClose}
          footer={null}
          width={700}
          height={500}
          className="show-album bg-comp-gray-bg"
        >
          {selectedAlbum && (
            <>
              <Carousel>
                {currentImages.map((image: any) => (
                  <div key={image.id}>
                    <Image
                      src={image.url}
                      alt={image.id}
                      width={700}
                      height={500}
                      preview={false}
                      loading="lazy"
                    />
                  </div>
                ))}
              </Carousel>
            </>
          )}
        </Modal>
      </div>
    </>
  );
};

export default ShowAlbum;
