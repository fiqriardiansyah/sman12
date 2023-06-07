import type { ColumnsType } from "antd/es/table";
import { useState, ComponentType } from "react";
import EditTable, { Props as EditTableProps } from "components/table/editable-table";

export interface Nilai {
    id?: any;
    mata_pelajaran?: string;
    nilai?: any;
    catatan?: string;
}

type Props<T> = Omit<EditTableProps<T>, "isEditing" | "findIndexSave" | "rowKey" | "editInputType" | "columns">;

export function editTableNilai<T extends Nilai>(Component: ComponentType<EditTableProps<T>>) {
    return function (props: Props<T>) {
        const columns: ColumnsType<T> = [
            {
                title: "Mata Pelajaran",
                dataIndex: "mata_pelajaran",
                ...{ editable: true },
                render: (text) => <p className="m-0 capitalize">{text || "-"}</p>,
            },
            {
                title: "Nilai",
                dataIndex: "nilai",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text || "-"}</p>,
            },
            {
                title: "Catatan",
                dataIndex: "catatan",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text || "-"}</p>,
            },
        ];

        const isEditing = (record: Nilai, edited: Nilai | null) => record.id === edited?.id;
        const findIndexSave = (record: Nilai, edited: Nilai) => record.id === edited.id;
        const rowKey = (record: Nilai) => record.id! as any;
        const editInputType: EditTableProps<Nilai>["editInputType"] = { mata_pelajaran: "text", nilai: "number", catatan: "text" };

        return (
            <Component
                {...props}
                editInputType={editInputType}
                rowKey={rowKey}
                columns={columns}
                isEditing={isEditing}
                findIndexSave={findIndexSave}
            />
        );
    };
}

const RaportTable = editTableNilai(EditTable);
export default RaportTable;
