import { Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UseQueryResult } from "react-query";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

export interface Guru {
    id?: string;
    nama?: string;
    nuptk?: string;
    nip?: string;
    email?: string;
    hp?: string;
    alamat?: string;
    foto?: string;
    kelas?: string;
    kelas_id?: string;
    kelamin?: any;
}

type Props = {
    fetcher: UseQueryResult<Guru[], unknown>;
};

function TableGuru({ fetcher }: Props) {
    const columns: ColumnsType<Guru> = [
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
            title: "NIP",
            dataIndex: "nip",
            render: (text) => <p className="m-0">{text || "-"}</p>,
        },
        {
            title: "Wali kelas",
            dataIndex: "kelas",
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
                <Link to={`${STAFF_PATH.masterdata.dataguru.edit}/${record.id}`}>
                    <Button>edit</Button>
                </Link>
            ),
        },
    ];

    return (
        <Table
            rowKey={(record) => record.id!}
            size="small"
            loading={fetcher.isLoading}
            columns={columns}
            dataSource={fetcher.data || []}
            className="w-full"
        />
    );
}

export default TableGuru;
