import { Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Siswa } from "modules/datasiswa/table";

type Props = {
    siswa: Siswa[];
};

function TableSiswaKelas({ siswa }: Props) {
    const columns: ColumnsType<Siswa> = [
        {
            title: "Nama",
            dataIndex: "nama",
            render: (text) => <p className="m-0 capitalize">{text}</p>,
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
            render: (_, record) => <Button>Hapus</Button>,
        },
    ];

    return <Table rowKey={(record) => record.id!} size="small" columns={columns} dataSource={siswa || []} className="w-full" />;
}

export default TableSiswaKelas;
