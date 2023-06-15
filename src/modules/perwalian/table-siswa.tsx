import { Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Siswa } from "modules/datasiswa/table";
import { Link } from "react-router-dom";
import { TEACHER_PATH } from "utils/constant";

type Props = {
    siswa: Siswa[];
};

function PerwalianTableSiswa({ siswa }: Props) {
    const columns: ColumnsType<Siswa> = [
        {
            title: "Nama",
            dataIndex: "nama",
            render: (text) => <p className="m-0 capitalize">{text || "-"}</p>,
        },
        {
            title: "Nis",
            dataIndex: "nis",
            render: (text) => <p className="m-0">{text || "-"}</p>,
        },
        {
            title: "Nisn",
            dataIndex: "nisn",
            render: (text) => <p className="m-0">{text || "-"}</p>,
        },
        {
            width: "80px",
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, record) => (
                <Link to={`${TEACHER_PATH.siswa.index}/${record.id}`}>
                    <Button>Lihat</Button>
                </Link>
            ),
        },
    ];

    return <Table rowKey={(record) => record.id!} size="small" columns={columns} dataSource={siswa || []} className="w-full" />;
}

export default PerwalianTableSiswa;
