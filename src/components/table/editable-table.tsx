import { Button, Form, Popconfirm, Space, Table, TableProps, Typography } from "antd";
import { ColumnType } from "antd/es/table";
import EditableCell, { Props as EditableCellProps } from "components/table/editable-cell";
import React from "react";
import { FiEdit } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";

export type Props<T> = TableProps<T> & {
    loading?: boolean;
    allList?: T[];
    list: T[];
    setList?: React.Dispatch<React.SetStateAction<T[]>>;
    removeItemList?: (dt: T) => void;
    action?: boolean;
    columns: ColumnType<T>[];
    editRow: T | null;
    setEditRow: React.Dispatch<React.SetStateAction<T | null>>;
    rowKey: (record: T) => string;
    findIndexSave: (item: T, record: T) => boolean;
    isEditing: (record: T, edited: T | null) => boolean;
    editInputType: {
        [key: string]: EditableCellProps<T>["inputType"];
    };
    canEdit?: boolean;
    canRemove?: boolean;
    actionAddition?: (record: T) => React.ReactNode;
    onSetList?: (list: any[], prevRow?: T | null) => void;
    cellProps?: Partial<EditableCellProps<T>>;
    onCancel?: (data: T | null) => void;
};

export interface RowDefault {
    hideEditAction?: boolean;
    hideRemoveAction?: boolean;
}

function EditTable<T extends {}>({
    allList,
    list,
    loading,
    setList,
    removeItemList,
    action = true,
    findIndexSave,
    rowKey,
    columns,
    isEditing,
    editInputType,
    editRow,
    setEditRow,
    canEdit = true,
    canRemove = true,
    onSetList,
    cellProps,
    actionAddition,
    onCancel,
    ...props
}: Props<T>) {
    const [form] = Form.useForm();

    const onEdit = (record: T) => {
        form.setFieldsValue(record);
        setEditRow(record);
    };

    const cancel = () => {
        if (onCancel) onCancel(editRow);
        setEditRow(null);
    };

    const save = async (record: T) => {
        try {
            const row = (await form.validateFields()) as T;

            const newData = [...(allList || list)];
            const index = newData.findIndex((item) => findIndexSave(item, record));
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                if (setList) {
                    setList(newData);
                }
                if (onSetList) {
                    onSetList(newData, editRow);
                }
                setEditRow(null);
            } else {
                newData.push(row);
                if (setList) {
                    setList(newData);
                }
                if (onSetList) {
                    onSetList(newData, editRow);
                }
                setEditRow(null);
            }
        } catch (errInfo) {
            console.log("Validate Failed:", errInfo);
        }
    };

    const actions: ColumnType<T> = {
        width: "130px",
        title: "Action",
        dataIndex: "action",
        fixed: "right",
        render: (_: any, record: RowDefault) => {
            const editable = isEditing(record as T, editRow);
            return editable ? (
                <Space>
                    <Typography.Link onClick={() => save(record as T)} style={{ marginRight: 8 }}>
                        Save
                    </Typography.Link>
                    <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                        <a>Cancel</a>
                    </Popconfirm>
                </Space>
            ) : (
                <div className="w-full flex gap-3">
                    {canEdit && !record?.hideEditAction && (
                        <Button disabled={!!editRow} type="text" onClick={() => onEdit(record as T)}>
                            <FiEdit className="text-lg" />
                        </Button>
                    )}
                    {canRemove && !record?.hideRemoveAction && (
                        <Button disabled={!!editRow} type="text" danger onClick={() => removeItemList && removeItemList(record as T)}>
                            <MdOutlineDeleteOutline className="text-lg" />
                        </Button>
                    )}
                    {actionAddition && actionAddition(record as T)}
                </div>
            );
        },
    };

    if (action) {
        if (!columns.find((col: any) => col?.dataIndex === "action")) {
            columns.push(actions);
        }
    }

    const mergedColumns = columns.map((col: any) => {
        if (!col.editable) return col;
        return {
            ...col,
            onCell: (record: T) => ({
                record,
                inputType: editInputType[col.dataIndex] || "text",
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record, editRow),
            }),
        };
    });

    return (
        <Form form={form} component={false}>
            <Table
                loading={loading}
                rowKey={rowKey}
                components={{
                    body: {
                        cell: (cProps: any) => <EditableCell {...cProps} {...cellProps} />,
                    },
                }}
                size="small"
                columns={mergedColumns}
                dataSource={list || []}
                pagination={{
                    pageSize: 10,
                    total: list?.length,
                    showSizeChanger: false,
                }}
                {...props}
            />
        </Form>
    );
}

export default EditTable;
