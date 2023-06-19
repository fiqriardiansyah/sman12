import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import moment from "moment";
import { UseQueryResult } from "react-query";
import { Link } from "react-router-dom";
import { CATEGORY_NEWS, FORMATE_DATE_TIME, FORMAT_DATE, STAFF_PATH } from "utils/constant";

export type Pengumuman = {
    id?: any;
    judul?: any;
    isi?: any;
    tanggal_dibuat?: any;
    tanggal_edit?: any;
    dibuat_oleh?: any;
    edit_oleh?: any;
    category?: any;
};

type Props = {
    fetcher: UseQueryResult<Pengumuman[], unknown>;
};

function TablePengumuman({ fetcher }: Props) {
    const columns: ColumnsType<Pengumuman> = [
        {
            title: "Judul",
            dataIndex: "judul",
            render: (text, record) => (
                <div className="m-0 capitalize">
                    {text}{" "}
                    {moment(record.tanggal_dibuat).format(FORMAT_DATE) === moment(moment.now()).format(FORMAT_DATE) ? (
                        <Tag color="blue">Baru</Tag>
                    ) : null}
                </div>
            ),
        },
        {
            title: "Kategory",
            dataIndex: "category",
            render: (text) => <p className="m-0 capitalize">{CATEGORY_NEWS.find((el) => el.value === text)?.label}</p>,
        },
        {
            title: "Tanggal Upload",
            dataIndex: "tanggal_dibuat",
            render: (text) => <p className="m-0">{moment(text).format(FORMATE_DATE_TIME)}</p>,
        },
        {
            title: "Diupload oleh",
            dataIndex: "dibuat_oleh",
            render: (text) => <p className="m-0">{text}</p>,
        },
        {
            title: "Tanggal Edit",
            dataIndex: "tanggal_edit",
            render: (text) => <p className="m-0">{text ? moment(text).format(FORMATE_DATE_TIME) : ""}</p>,
        },
        {
            title: "Diedit oleh",
            dataIndex: "edit_oleh",
            render: (text) => <p className="m-0">{text || ""}</p>,
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

export default TablePengumuman;
