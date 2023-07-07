import { Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UseQueryResult } from "react-query";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";
import { Siswa } from "./datasiswa/table";

type Props = {
    fetcher: UseQueryResult<Siswa[], unknown>;
};

function TableSiswaAlumni({ fetcher }: Props) {
    const columns: ColumnsType<Siswa> = [
        {
            title: "Nama",
            dataIndex: "nama",
            render: (text) => <p className="m-0 capitalize">{text}</p>,
        },
        {
            title: "Stambuk",
            dataIndex: "-",
            render: (_, record) => (
                <p className="m-0">
                    {record?.stambuk}-{record?.lulus}
                </p>
            ),
        },
        {
            title: "NIS",
            dataIndex: "nis",
            render: (text) => <p className="m-0">{text}</p>,
        },
        {
            title: "NISN",
            dataIndex: "nisn",
            render: (text) => <p className="m-0">{text}</p>,
        },
        {
            width: "80px",
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, record) => (
                <Link to={`${STAFF_PATH.alumni.index}/${record.id}`}>
                    <Button>Lihat</Button>
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

export default TableSiswaAlumni;
