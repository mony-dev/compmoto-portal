import React from "react";
import { useController } from "react-hook-form";
import { DatePicker } from "antd";
import dayjs from "dayjs";

function DatePickers(props:  any) {
  const { field, fieldState } = useController(props);
  console.log("field", field)
  return (
    <div className="flex flex-col">
      <DatePicker
        className="h-14"
        placeholder={props.placeholder}
        status={fieldState.error ? "error" : undefined}
        ref={field.ref}
        name={field.name}
        onBlur={field.onBlur}
        value={field.value ? dayjs(field.value) : null}
        onChange={(date) => {
            field.onChange(date ? date.toISOString() : null);
        }}
      />
      <span className="text-red-500 text-left">
        {fieldState?.error?.message}
      </span>
    </div>
  );
}

export default DatePickers;