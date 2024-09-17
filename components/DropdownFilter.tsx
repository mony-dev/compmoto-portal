"use client";

import React, { useEffect, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';

interface Option {
  key: number;
  label: string;
  type: string;
}

interface SelectedItem {
  id: number | string;
  name: string;
  type: string;
}

interface DropdownFilterProps {
  items: Option[];
  buttonTitle: string;
  selectedItems: SelectedItem[];
  onFilterChange: (selectedItems: SelectedItem[]) => void; 
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({ items, buttonTitle, selectedItems, onFilterChange }) => {
  const { t } = useTranslation();
  const [localSelectedItems, setLocalSelectedItems] = useState<SelectedItem[]>(
    selectedItems
  );

    useEffect(() => {
      setLocalSelectedItems(selectedItems); // Sync with parent when selectedItems change
    }, [selectedItems]);
    const isAllChecked = items.length > 0 && localSelectedItems.length === items.length;

    const handleCheckboxChange = (key: number | string, label: string, type: string) => {
      const selectedItem = { id: key, name: label, type: type };
      const updatedItems = localSelectedItems.some((item) => item.id === key)
        ? localSelectedItems.filter((item) => item.id !== key)
        : [...localSelectedItems, selectedItem];
  
      setLocalSelectedItems(updatedItems);
      onFilterChange(updatedItems);
    };

  const handleAllChange = () => {
    const updatedItems = isAllChecked ? [] : items.map((item) => ({
      id: item.key,
      name: item.label,
      type: item.type,
    }));

    setLocalSelectedItems(updatedItems);
    onFilterChange(updatedItems);
  };
  // Custom menu with checkboxes, including the "All" option
  const menu = (
    <div
      style={{ 
        padding: '10px', 
        maxHeight: '200px', 
        overflowY: 'auto', 
        boxShadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.08)',
      }}
      className='menu-filter'
      onMouseLeave={(e) => {
        // Close dropdown on mouse leave
        (e.currentTarget as HTMLElement).parentElement?.blur();
      }}
    >
      {/* "All" checkbox */}
      <div key={-1}>
        <Checkbox checked={isAllChecked} onChange={handleAllChange}>
          {t("all")}
        </Checkbox>
      </div>
      {/* Individual items */}
      {items.map((item) => (
        <div key={item.key}>
          <Checkbox
            checked={localSelectedItems.some((i) => i.id === item.key)}
            onChange={() => handleCheckboxChange(item.key, item.label, item.type)}
          >
            {item.label}
          </Checkbox>
        </div>
      ))}
    </div>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      overlayClassName="dropdown-filter bg-white"
    >
      <Button className="w-full flex justify-between rounded-none">
        <p className="default-font text-sm mb-0 font-semibold text-comp-red">{buttonTitle}</p>
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default DropdownFilter;
