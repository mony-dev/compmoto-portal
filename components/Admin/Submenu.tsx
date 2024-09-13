import React, { useEffect, useState } from "react";
import axios from "axios";

interface MenuItemType {
  key: string;
  label: string;
  children?: MenuItemType[];
  labelTag: string;
}

interface SubmenuProps {
  onFilterChange: (filters: {
    lv1?: { id: string; label: string };
    lv2?: { id: string; label: string };
    lv3?: { id: string; label: string };
  }) => void;
  minisizeId: number;
  t: any;
}

const Submenu: React.FC<SubmenuProps> = ({ onFilterChange, minisizeId,t }) => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{
    lv1?: { id: string; label: string };
    lv2?: { id: string; label: string };
    lv3?: { id: string; label: string };
  }>({});

  const [newFilter, setNewFilter] = useState<{
    lv1?: { id: string; label: string };
    lv2?: { id: string; label: string };
    lv3?: { id: string; label: string };
  }>({});
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`/api/getMenuItems`, {
          params: { minisizeId },
        });
        const items: MenuItemType[] = response.data;
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu items: ", error);
      }
    };

    if (minisizeId) {
      fetchMenuItems();
    }
  }, [minisizeId]);

  const handleClick = (
    event: React.MouseEvent,
    key: string,
    labelTag: string
  ) => {
    event.stopPropagation(); // Stop the event from propagating to parent elements

    const [lv1, lv2, lv3] = key.split("-");
    const [lv1Tag, lv2Tag, lv3Tag] = labelTag.split(">");

    const newFilters: {
      lv1?: { id: string; label: string };
      lv2?: { id: string; label: string };
      lv3?: { id: string; label: string };
    } = {};
    if (lv1) newFilters.lv1 = { id: lv1, label: lv1Tag };
    if (lv2) newFilters.lv2 = { id: lv2, label: lv2Tag };
    if (lv3) newFilters.lv3 = { id: lv3, label: lv3Tag };

    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const renderMenu = (
    items: MenuItemType[],
    level: number = 1
  ): React.ReactNode => {
    return items.map((item) => (
      <div
        key={item.key}
        className={`menuItem level-${level}`}
        onClick={(event) => handleClick(event, item.key, item.labelTag)}
      >
        <div>{item.label}</div>
        {item.children && (
          <div className="subMenu">{renderMenu(item.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="dropdown dropdown-filter">
      <div className="dropdownToggle flex items-center gap-4">
        <p className="m-0 text-white">{t('brand_product')}</p>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 0.0454549C5.22209 0.0454549 5.44418 0.121401 5.61952 0.284142L9.74576 4.11399C10.0847 4.42862 10.0847 4.94939 9.74576 5.26403C9.40678 5.57866 8.8457 5.57866 8.50672 5.26403L5 2.0092L1.49328 5.26403C1.15429 5.57866 0.59322 5.57866 0.254237 5.26403C-0.0847464 4.94939 -0.0847465 4.42862 0.254237 4.11399L4.38048 0.284143C4.55581 0.121401 4.77791 0.045455 5 0.0454549Z"
            fill="white"
          />
        </svg>
      </div>
      <div className="dropdownMenu">{renderMenu(menuItems)}</div>
    </div>
  );
};

export default Submenu;
