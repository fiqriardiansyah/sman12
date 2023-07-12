/* eslint-disable react/destructuring-assignment */
import type { ColumnsType } from "antd/es/table";
import EditTable, { Props as EditTableProps } from "components/table/editable-table";
import dayjs from "dayjs";
import { httpsCallable } from "firebase/functions";
import { Pelajaran } from "pages/staff/masterdata/datapelajaran/add";
import { ComponentType } from "react";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";

export interface Roster {
    id?: any;
    mata_pelajaran?: string;
    jam?: string;
}

export const istirahat = { label: <span className="text-red-500">Istirahat</span>, value: "istirahat" };
export const upacara = { label: <span className="text-blue-500">Upacara</span>, value: "upacara" };

type Props<T> = Omit<EditTableProps<T>, "isEditing" | "findIndexSave" | "rowKey" | "editInputType" | "columns"> & {
    day: string;
};

const getSubjects = httpsCallable(functionInstance, "getSubjects");

export function editTableRoster<T extends Roster>(Component: ComponentType<EditTableProps<T>>) {
    return function (props: Props<T>) {
        const subjectsQuery = useQuery(["get-subject"], async () => {
            return ((await getSubjects()).data as Pelajaran[])?.map((el) => ({
                label: `${el.mata_pelajaran} ${el?.guru_nama ? ` - ${el?.guru_nama}` : ""}`?.CapitalizeEachFirstLetter(),
                value: el.id,
            }));
        });

        const columns: ColumnsType<T> = [
            {
                title: "Les",
                render: (t, r, i) => i + 1,
            },
            {
                title: "Mata Pelajaran - Guru",
                dataIndex: "mata_pelajaran",
                ...{ editable: true },
                render: (text) => {
                    if (text?.toLowerCase() === istirahat.value) {
                        return istirahat.label;
                    }
                    if (text?.toLowerCase() === upacara.value) {
                        return upacara.label;
                    }
                    return <p className="m-0 capitalize">{text ? subjectsQuery.data?.find((el) => el.value === text)?.label : ""}</p>;
                },
            },
            {
                title: "Jam",
                dataIndex: "jam",
                ...{ editable: true },
                render: (row) => <p className="m-0">{row ? dayjs(row).format("HH:mm") : ""}</p>,
            },
        ];

        const isEditing = (record: Roster, edited: Roster | null) => record.id === edited?.id;
        const findIndexSave = (record: Roster, edited: Roster) => record.id === edited.id;
        const rowKey = (record: Roster) => record.id! as any;
        const editInputType: EditTableProps<Roster>["editInputType"] = { mata_pelajaran: "select", jam: "time" };

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
                        options:
                            props.day === "senin" ? [upacara, ...(subjectsQuery.data || []), istirahat] : [...(subjectsQuery.data || []), istirahat],
                        className: "!w-[300px]",
                        placeholder: "pilih",
                        loading: subjectsQuery.isLoading,
                    },
                }}
            />
        );
    };
}

const TableRoster = editTableRoster(EditTable);
export default TableRoster;
