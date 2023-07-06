import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import EditTable, { Props as EditTableProps } from "components/table/editable-table";
import dayjs from "dayjs";
import moment from "moment";
import { ComponentType, useState } from "react";
import { HiBadgeCheck } from "react-icons/hi";
import { httpsCallable } from "firebase/functions";
import { Staff } from "modules/datastaff/table";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { FORMATE_DATE_TIME, FORMAT_DATE_DAYJS, MONTHS, SPP_PAYMENT_METHOD } from "utils/constant";

export interface SppTable {
    id?: any;
    month?: any;
    pay_date?: any;
    amount?: any;
    note?: any;
    method?: any;
    author_id?: any;
    legalized?: any;
    legalized_date?: any;
    student_id?: any;
    class?: any;
    status?: "pending" | "approved" | "rejected";
    reason?: string;
}

type Props<T> = Omit<EditTableProps<T>, "editRow" | "setEditRow" | "isEditing" | "findIndexSave" | "rowKey" | "editInputType" | "columns"> & {
    cls: string;
    currentCls: string;
};

const getStaffs = httpsCallable(functionInstance, "getStaffs");

export function editTableSppMonth<T extends SppTable>(Component: ComponentType<EditTableProps<T>>) {
    return function ({ cls, currentCls, ...props }: Props<T>) {
        const [editRow, setEditRow] = useState<T | null>(null);

        const getStaffsQuery = useQuery(["get-staff"], async () => {
            return (await getStaffs()).data as Staff[];
        });

        const columns: ColumnsType<T> = [
            {
                title: "Bulan",
                dataIndex: "month",
                width: "200px",
                render: (text, record) => {
                    const isSameOrBeforeMonth = MONTHS.indexOf(record?.month || "") <= MONTHS.indexOf(moment().format("MMMM")?.toLowerCase());
                    const isDebt = isSameOrBeforeMonth && cls?.length <= currentCls?.length && !record.pay_date;
                    return (
                        <p className="m-0 capitalize flex">
                            {text}
                            {isDebt ? (
                                <Tag className="ml-4" color="magenta">
                                    menunggak
                                </Tag>
                            ) : null}
                        </p>
                    );
                },
            },
            {
                title: "Tanggal Bayar",
                dataIndex: "pay_date",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text ? dayjs(text).format(FORMAT_DATE_DAYJS) : ""}</p>,
            },
            {
                title: "Jumlah",
                dataIndex: "amount",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text ? (text as number)?.ToIndCurrency("Rp") : ""}</p>,
            },
            {
                title: "Metode Bayar",
                dataIndex: "method",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text ? SPP_PAYMENT_METHOD.find((el) => el.value === text)?.label : ""}</p>,
            },
            {
                title: "Keterangan",
                dataIndex: "note",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text}</p>,
            },
            {
                title: "Dibuat oleh",
                dataIndex: "author_id",
                render: (text) => <p className="m-0">{text ? getStaffsQuery.data?.find((staff) => staff.id === text)?.nama : ""}</p>,
            },
            {
                title: "Disahkan",
                dataIndex: "legalized",
                render: (text, record) => {
                    if (!record?.status) return "";
                    if (record?.status === "pending") return <Tag color="yellow">Pending</Tag>;
                    if (record?.status === "rejected")
                        return (
                            <p className="m-0 text-red-400 text-xs">
                                <Tag color="red">Rejected</Tag>
                                <br />
                                {record?.reason}
                            </p>
                        );
                    return (
                        <div className="flex items-center">
                            <HiBadgeCheck className="text-green-400 text-xl mr-2" />
                            <div className="">
                                <p className="m-0 text-green-500 text-sm capitalize leading-none">
                                    {text ? getStaffsQuery.data?.find((staff) => staff.id === text)?.nama : ""}
                                </p>
                                <p className="m-0 text-gray-500 text-sm capitalize leading-none">{record.legalized_date}</p>
                            </div>
                        </div>
                    );
                },
            },
        ];

        const isEditing = (record: SppTable, edited: SppTable | null) => record.month === edited?.month;
        const findIndexSave = (record: SppTable, edited: SppTable) => record.month === edited.month;
        const rowKey = (record: SppTable) => record.month! as any;
        const editInputType: EditTableProps<SppTable>["editInputType"] = { pay_date: "date", amount: "number", note: "text", method: "select" };

        return (
            <Component
                {...props}
                size="small"
                editRow={editRow}
                setEditRow={setEditRow}
                editInputType={editInputType}
                rowKey={rowKey}
                columns={columns}
                isEditing={isEditing}
                findIndexSave={findIndexSave}
                canRemove={false}
                pagination={false}
                cellProps={{
                    selectProps: {
                        options: SPP_PAYMENT_METHOD,
                        className: "!w-[200px]",
                        placeholder: "Pilih",
                    },
                }}
            />
        );
    };
}

const TableSppMonth = editTableSppMonth(EditTable);
export default TableSppMonth;
