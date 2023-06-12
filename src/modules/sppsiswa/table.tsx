import { Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Siswa } from "modules/datasiswa/table";
import { UseQueryResult } from "react-query";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

type Props = {
    fetcher: UseQueryResult<Siswa[], unknown>;
};

function TableSppSiswa({ fetcher }: Props) {
    const columns: ColumnsType<Siswa> = [
        {
            title: "Nama",
            dataIndex: "nama",
            render: (text) => <p className="m-0 capitalize">{text}</p>,
        },
        {
            title: "Kelas",
            dataIndex: "kelas",
            render: (text) => <p className="m-0">{text}</p>,
        },
        {
            title: "Nis",
            dataIndex: "nis",
            render: (text) => <p className="m-0">{text}</p>,
        },
        {
            title: "Nisn",
            dataIndex: "nisn",
            render: (text) => <p className="m-0">{text}</p>,
        },
        {
            width: "80px",
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, record) => (
                <Link to={`${STAFF_PATH.infosiswa.sppsiswa.edit}/${record.id}`}>
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

export default TableSppSiswa;
