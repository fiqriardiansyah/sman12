import { Button, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UseQueryResult } from "react-query";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

export interface Siswa {
    id?: string;
    nama?: string;
    nis?: string;
    nisn?: string;
    wali?: string;
    email?: string;
    hp?: string;
    alamat?: string;
    kelas?: string;
    kelas_id?: string;
    foto?: string;
    kelamin?: any;
    stambuk?: string;
    lulus?: string;
    tgl_lahir?: any;
    tempat_lahir?: any;
    hp_wali?: string;
}

type Props = {
    fetcher: UseQueryResult<Siswa[], unknown>;
};

function TableSiswa({ fetcher }: Props) {
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
                <Link to={`${STAFF_PATH.masterdata.datasiswa.edit}/${record.id}`}>
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

export default TableSiswa;
