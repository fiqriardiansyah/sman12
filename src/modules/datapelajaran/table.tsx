import { Button, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Pelajaran } from "pages/staff/masterdata/datapelajaran/add";
import { UseQueryResult } from "react-query";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

type Props = {
    fetcher: UseQueryResult<Pelajaran[], unknown>;
};

function TablePelajaran({ fetcher }: Props) {
    const columns: ColumnsType<Pelajaran> = [
        {
            title: "Mata pelajaran",
            dataIndex: "mata_pelajaran",
            render: (text) => <p className="m-0 capitalize">{text || "-"}</p>,
        },
        {
            title: "Guru",
            dataIndex: "guru_nama",
            render: (text) => <p className="m-0">{text || "-"}</p>,
        },
        {
            width: "80px",
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, record) => (
                <Link to={`${STAFF_PATH.masterdata.datapelajaran.edit}/${record.id}`}>
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
            loading={fetcher.isLoading}
            dataSource={fetcher.data || []}
            className="w-full"
        />
    );
}

export default TablePelajaran;
