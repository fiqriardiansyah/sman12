import { Button, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Siswa } from "modules/datasiswa/table";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

export type Pengumuman = {
    id?: any;
    title?: any;
    body?: any;
    created_at?: any;
    updated_at?: any;
    created_by?: any;
    updated_by?: any;
};

type Props = {
    pengumuman: Pengumuman[];
};

function TablePengumuman({ pengumuman }: Props) {
    const columns: ColumnsType<Pengumuman> = [
        {
            title: "Judul",
            dataIndex: "title",
            render: (text) => <p className="m-0 capitalize">{text || "-"}</p>,
        },
        {
            title: "Isi",
            dataIndex: "body",
            render: (text) => <p className="m-0">{text || "-"}</p>,
        },
        {
            title: "Tanggal Upload",
            dataIndex: "created_at",
            render: (text) => <p className="m-0">{text || "-"}</p>,
        },
        {
            title: "Diupload oleh",
            dataIndex: "created_at",
            render: (text) => <p className="m-0">{text || "-"}</p>,
        },
        {
            width: "80px",
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, record) => (
                <Link to={`${STAFF_PATH.pengumuman.edit}/${record.id}`}>
                    <Button>edit</Button>
                </Link>
            ),
        },
    ];

    return <Table rowKey={(record) => record.id!} size="small" columns={columns} dataSource={pengumuman || []} className="w-full" />;
}

export default TablePengumuman;
