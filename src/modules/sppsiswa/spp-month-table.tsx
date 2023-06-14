import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import EditTable, { Props as EditTableProps } from "components/table/editable-table";
import moment from "moment";
import { ComponentType, useState } from "react";
import { MONTHS } from "utils/constant";

export interface SppTable {
    id?: any;
    month?: any;
    pay_date?: any;
    amount?: any;
    note?: any;
}

type Props<T> = Omit<EditTableProps<T>, "editRow" | "setEditRow" | "isEditing" | "findIndexSave" | "rowKey" | "editInputType" | "columns"> & {
    cls: string;
    currentCls: string;
};

export function editTableSppMonth<T extends SppTable>(Component: ComponentType<EditTableProps<T>>) {
    return function ({ cls, currentCls, ...props }: Props<T>) {
        const [editRow, setEditRow] = useState<T | null>(null);

        const columns: ColumnsType<T> = [
            {
                title: "Bulan",
                dataIndex: "month",
                width: "200px",
                render: (text, record) => {
                    const isSameOrBeforeMonth = MONTHS.indexOf(record.month || "") <= MONTHS.indexOf(moment().format("MMMM")?.toLowerCase());
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
                render: (text) => <p className="m-0">{text}</p>,
            },
            {
                title: "Jumlah",
                dataIndex: "amount",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text ? (text as number)?.ToIndCurrency("Rp") : ""}</p>,
            },
            {
                title: "Keterangan",
                dataIndex: "note",
                ...{ editable: true },
                render: (text) => <p className="m-0">{text}</p>,
            },
        ];

        const isEditing = (record: SppTable, edited: SppTable | null) => record.month === edited?.month;
        const findIndexSave = (record: SppTable, edited: SppTable) => record.month === edited.month;
        const rowKey = (record: SppTable) => record.month! as any;
        const editInputType: EditTableProps<SppTable>["editInputType"] = { pay_date: "text", amount: "number", note: "text" };

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
            />
        );
    };
}

const TableSppMonth = editTableSppMonth(EditTable);
export default TableSppMonth;
