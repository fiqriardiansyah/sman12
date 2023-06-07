import { Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Siswa } from "modules/datasiswa/table";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

export interface Kelas {
    id?: string;
    nama?: string;
    wali?: string;
    daftarMurid?: Partial<Siswa>[];
}

type Props = {
    kelas: Kelas[];
};

function TableKelas({ kelas }: Props) {
    const columns: ColumnsType<Kelas> = [
        {
            title: "Kelas",
            dataIndex: "nama",
            render: (text) => <p className="m-0 capitalize">{text || "-"}</p>,
        },
        {
            title: "Wali Kelas",
            dataIndex: "wali",
            render: (text) => <p className="m-0">{text || "-"}</p>,
        },
        {
            width: "80px",
            title: "Action",
            key: "action",
            fixed: "right",
            render: (_, record) => (
                <Link to={`${STAFF_PATH.masterdata.datakelas.edit}/${record.id}`}>
                    <Button>edit</Button>
                </Link>
            ),
        },
    ];

    return <Table rowKey={(record) => record.id!} size="small" columns={columns} dataSource={kelas || []} className="w-full" />;
}

export default TableKelas;
