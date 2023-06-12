import { Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UseQueryResult } from "react-query";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

export interface Staff {
    id?: string;
    nama?: string;
    nuptk?: string;
    email?: string;
    hp?: string;
    alamat?: string;
    kelamin?: any;
    posisi?: string;
    foto?: string;
}

type Props = {
    fetcher: UseQueryResult<Staff[], unknown>;
};

function TableStaff({ fetcher }: Props) {
    const columns: ColumnsType<Staff> = [
        {
            title: "Nama",
            dataIndex: "nama",
            render: (text) => <p className="m-0 capitalize">{text || "-"}</p>,
        },
        {
            title: "NUPTK",
            dataIndex: "nuptk",
            render: (text) => <p className="m-0">{text || "-"}</p>,
        },
        {
            title: "Handphone",
            dataIndex: "hp",
            render: (text) => <p className="m-0">{text || "-"}</p>,
        },
        {
            width: "80px",
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, record) => (
                <Link to={`${STAFF_PATH.masterdata.datastaff.edit}/${record.id}`}>
                    <Button>edit</Button>
                </Link>
            ),
        },
    ];

    return (
        <Table
            rowKey={(record) => record.id!}
            size="small"
            columns={columns}
            dataSource={fetcher.data || []}
            loading={fetcher.isLoading}
            className="w-full"
        />
    );
}

export default TableStaff;
