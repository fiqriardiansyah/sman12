import type { ColumnsType } from "antd/es/table";
import EditTable, { Props as EditTableProps } from "components/table/editable-table";
import { httpsCallable } from "firebase/functions";
import { Pelajaran } from "pages/staff/masterdata/datapelajaran/add";
import { ComponentType } from "react";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";

export interface Nilai {
    id?: any;
    mata_pelajaran?: string;
    nilai?: any;
    catatan?: string;
}

type Props<T> = Omit<EditTableProps<T>, "isEditing" | "findIndexSave" | "rowKey" | "editInputType" | "columns">;

const getSubjects = httpsCallable(functionInstance, "getSubjects");

export function editTableNilai<T extends Nilai>(Component: ComponentType<EditTableProps<T>>) {
    return function (props: Props<T>) {
        const subjectsQuery = useQuery(["get-subject"], async () => {
            return ((await getSubjects()).data as Pelajaran[])?.map((el) => ({
                label: el.mata_pelajaran?.CapitalizeEachFirstLetter(),
                value: el.id,
            }));
        });

        const columns: ColumnsType<T> = [
            {
                title: "Mata Pelajaran",
                dataIndex: "mata_pelajaran",
                ...{ editable: true },
                render: (text) => <p className="m-0 capitalize">{text ? subjectsQuery.data?.find((el) => el.value === text)?.label : ""}</p>,
            },
            {
                title: "Nilai",
                dataIndex: "nilai",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text}</p>,
            },
            {
                title: "Catatan",
                dataIndex: "catatan",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text}</p>,
            },
            {
                title: "Catatan",
                dataIndex: "catatan",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text}</p>,
            },
        ];

        const isEditing = (record: Nilai, edited: Nilai | null) => record.id === edited?.id;
        const findIndexSave = (record: Nilai, edited: Nilai) => record.id === edited.id;
        const rowKey = (record: Nilai) => record.id! as any;
        const editInputType: EditTableProps<Nilai>["editInputType"] = { mata_pelajaran: "select", nilai: "number", catatan: "text" };

        return (
            <Component
                {...props}
                editInputType={editInputType}
                rowKey={rowKey}
                columns={columns}
                isEditing={isEditing}
                findIndexSave={findIndexSave}
                cellProps={{
                    maxNumber: 100,
                    minNumber: 0,
                    selectProps: {
                        options: subjectsQuery.data || [],
                        className: "!w-[300px]",
                        placeholder: "pilih",
                        loading: subjectsQuery.isLoading,
                    },
                }}
            />
        );
    };
}

const RaportTable = editTableNilai(EditTable);
export default RaportTable;
