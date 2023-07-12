/* eslint-disable react/destructuring-assignment */
import type { ColumnsType } from "antd/es/table";
import EditTable, { Props as EditTableProps } from "components/table/editable-table";
import { httpsCallable } from "firebase/functions";
import { Staff } from "modules/datastaff/table";
import { Pelajaran } from "pages/staff/masterdata/datapelajaran/add";
import { ComponentType } from "react";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";

export interface Nilai {
    id?: any;
    mata_pelajaran?: string;
    nilai?: any;
    catatan?: string;
    author_id?: string;
}

type Props<T> = Omit<EditTableProps<T>, "isEditing" | "findIndexSave" | "rowKey" | "editInputType" | "columns">;

const getNoDuplicateSubjects = httpsCallable(functionInstance, "getNoDuplicateSubjects");
const getStaffs = httpsCallable(functionInstance, "getStaffs");

export function editTableNilai<T extends Nilai>(Component: ComponentType<EditTableProps<T>>) {
    return function (props: Props<T>) {
        const subjectsQuery = useQuery(["get-subject"], async () => {
            return ((await getNoDuplicateSubjects()).data as Pelajaran[])?.map((el) => ({
                label: el.mata_pelajaran?.CapitalizeEachFirstLetter(),
                value: el.id,
            }));
        });

        const getStaffsQuery = useQuery(["get-staff"], async () => {
            return (await getStaffs()).data as Staff[];
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
                title: "Capaian Kompetensi",
                dataIndex: "catatan",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text}</p>,
            },
            {
                title: "Dibuat oleh",
                dataIndex: "author_id",
                render: (text) => <p className="m-0">{text ? getStaffsQuery.data?.find((staff) => staff.id === text)?.nama : ""}</p>,
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
                        showSearch: true,
                        optionFilterProp: "children",
                        filterOption: (input, option) => (option?.label ?? "")?.toString()?.toLowerCase().includes(input?.toLowerCase()),
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
