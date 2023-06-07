import { Button, Form, Input, Select, Space } from "antd";
import { ColumnsType } from "antd/es/table";
import Layout from "components/common/layout";
import TableTransfer from "components/common/table-transfer";
import { Siswa } from "modules/datasiswa/table";
import { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

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
];

function MasterDataKelasAdd() {
    const [targetKeys, setTargetKeys] = useState<string[]>([]);

    const onSaveSiswa = (values: Siswa) => {
        console.log("Success:", values);
    };

    const dummyTeacher = [
        {
            value: 1,
            label: "Sri spd",
        },
        {
            value: 2,
            label: "Joko sunjoyo",
        },
        {
            value: 3,
            label: "Roni saputra",
        },
    ];

    const siswa: Siswa[] = [
        {
            id: "12",
            nama: "sugiono",
            kelas: "XII IPA 1",
            nis: "12341234234234",
            nisn: "345634563e456",
        },
        {
            id: "12234",
            nama: "ahmad dani",
            kelas: "XII IPA 2",
            nis: "12341234234asdf234",
            nisn: "f2432323",
        },
        {
            id: "2",
            nama: "jono sugigi",
            kelas: "XII IPA 14",
            nis: "1232342",
            nisn: "34545",
        },
    ];

    const onChange = (nextTargetKeys: string[]) => {
        setTargetKeys(nextTargetKeys);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to={STAFF_PATH.masterdata.datakelas.index}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Tambah Kelas</h1>
                </Space>
            </div>
            <Form onFinish={onSaveSiswa} autoComplete="off" layout="vertical" requiredMark={false}>
                <div className="grid w-full grid-cols-3 gap-x-5">
                    <Form.Item label="Nama Kelas" name="kelas" rules={[{ required: true, message: "Nama kelas harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Wali Kelas" name="wali" rules={[{ required: true, message: "Wali kelas harus diisi!" }]}>
                        <Select options={dummyTeacher} />
                    </Form.Item>
                </div>
                <TableTransfer
                    titles={["Seluruh Siswa SMAN 12", "Kelas"]}
                    rowKey={(s: any) => s.id}
                    dataSource={siswa}
                    targetKeys={targetKeys}
                    showSearch
                    onChange={onChange}
                    filterOption={(inputValue, item) =>
                        item?.nama!.indexOf(inputValue) !== -1 || item.nis.indexOf(inputValue) !== -1 || item.nisn.indexOf(inputValue) !== -1
                    }
                    leftColumns={columns}
                    rightColumns={columns}
                />
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="mt-10">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default MasterDataKelasAdd;
