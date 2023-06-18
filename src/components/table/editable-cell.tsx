import {
    DatePicker,
    DatePickerProps,
    Form,
    Input,
    InputNumber,
    InputNumberProps,
    InputProps,
    Select,
    SelectProps,
    TimePicker,
    TimePickerProps,
} from "antd";
import dayjs from "dayjs";
import React from "react";
import { FORMAT_DATE_DAYJS } from "utils/constant";

export interface Props<T> extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: "number" | "text" | "select" | "date" | "time";
    record: T;
    index: number;
    children: React.ReactNode;
    minNumber?: number;
    maxNumber?: number;
    selectProps?: SelectProps;
    inputNumberProps?: InputNumberProps;
    inputTextProps?: InputProps;
    datePickerProps?: DatePickerProps;
    timePickerProps?: TimePickerProps;
}

function EditableCell<T extends {}>({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    minNumber = 0,
    maxNumber,
    selectProps,
    inputNumberProps,
    inputTextProps,
    datePickerProps,
    timePickerProps,
    ...restProps
}: Props<T>) {
    const inputNode = (() => {
        if (inputType === "number") return <InputNumber {...inputNumberProps} min={minNumber} max={maxNumber} />;
        if (inputType === "select") return <Select {...selectProps} />;
        if (inputType === "date") return <DatePicker {...datePickerProps} format={FORMAT_DATE_DAYJS} />;
        if (inputType === "time") return <TimePicker {...timePickerProps} format="HH:mm" />;
        return <Input {...inputTextProps} />;
    })();

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: dataIndex !== "note",
                            message: `${title} harus diisi!`?.CapitalizeEachFirstLetter(),
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
}

export default EditableCell;
