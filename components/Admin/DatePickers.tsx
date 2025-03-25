import React from "react";
import { useController } from "react-hook-form";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { RangePickerProps } from "antd/es/date-picker";

function DatePickers(props:  any) {
  const { field, fieldState } = useController(props);

  // eslint-disable-next-line arrow-body-style
const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  // Can not select days before today and today
  return current && current < dayjs().startOf('year');
};
  return (
    <div className="flex flex-col">
      {props.disabledDate ? 
      <DatePicker
      placeholder={props.placeholder}
      status={fieldState.error ? "error" : undefined}
      ref={field.ref}
      name={field.name}
      onBlur={field.onBlur}
      value={field.value ? dayjs(field.value) : null}
      onChange={(date, dateString) => {
        field.onChange(date ? date.toISOString() : null);
        props.onChange && props.onChange(dateString); // ส่ง dateString หรือจะส่ง date ก็ได้
      }}
      size={props.size}
      picker={props.picker}
      disabledDate={disabledDate}
    />
      :
      
      <DatePicker
        placeholder={props.placeholder}
        status={fieldState.error ? "error" : undefined}
        ref={field.ref}
        name={field.name}
        onBlur={field.onBlur}
        value={field.value ? dayjs(field.value) : null}
        onChange={(date, dateString) => {
          field.onChange(date ? date.toISOString() : null);
          props.onChange && props.onChange(dateString); // ส่ง dateString หรือจะส่ง date ก็ได้
        }}
        picker={props.picker}
        size={props.size}
      />
      }
      
      <span className="text-red-500 text-left">
        {fieldState?.error?.message}
      </span>
    </div>
  );
}

export default DatePickers;