import { Button, Form, Select, Space, message } from "antd";
import { ColumnsType } from "antd/es/table";
import TableTransfer from "components/common/table-transfer";
import { httpsCallable } from "firebase/functions";
import { Guru } from "modules/dataguru/table";
import { Siswa } from "modules/datasiswa/table";
import { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useMutation, useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { CLASS_OPTION, NUMBER_CLASS_OPTION, STAFF_PATH } from "utils/constant";

function MasterDataKelasAdd() {
    const createClass = httpsCallable(functionInstance, "createClass");
    const navigate = useNavigate();

    const createClassMutation = useMutation(["create-class"], async (data: any) => {
        return (await createClass(data)).data;
    });

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
    const getStudents = httpsCallable(functionInstance, "getStudents");
    const getTeachers = httpsCallable(functionInstance, "getTeachers");
    const [targetKeys, setTargetKeys] = useState<string[]>([]);

    const studentAvailableQuery = useQuery(["get-student"], async () => {
        return ((await getStudents()).data as Siswa[])?.filter((student) => !student.kelas);
    });

    const teacherAvailableQuery = useQuery(["get-teacher"], async () => {
        return ((await getTeachers()).data as Guru[])?.filter((t) => !t.kelas);
    });

    const onSaveKelas = (values: any) => {
        if (!targetKeys.length) {
            message.error("Pilih siswa terlebih dahulu");
            return;
        }
        const data = {
            ...values,
            wali_nama: teacherAvailableQuery.data?.find((t) => t.id === values.wali)?.nama,
            murid: targetKeys,
        };
        createClassMutation
            .mutateAsync(data)
            .then(() => {
                navigate(-1);
                message.success("Berhasil menambahkan data");
            })
            .catch((e) => {
                message.error(e?.message);
            });
    };

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
            <Form onFinish={onSaveKelas} autoComplete="off" layout="vertical" requiredMark={false}>
                <div className="grid w-full grid-cols-3 gap-x-5">
                    <Form.Item label="Tingkat Kelas" name="kelas" rules={[{ required: true, message: "Kelas harus diisi!" }]}>
                        <Select options={CLASS_OPTION} />
                    </Form.Item>

                    <Form.Item label="Nomor Kelas" name="nomor_kelas" rules={[{ required: true, message: "Nomor Kelas harus diisi!" }]}>
                        <Select options={NUMBER_CLASS_OPTION} />
                    </Form.Item>

                    <Form.Item label="Wali Kelas" name="wali" rules={[{ required: true, message: "Wali kelas harus diisi!" }]}>
                        <Select
                            showSearch
                            options={teacherAvailableQuery.data?.map((t) => ({ label: t.nama, value: t.id }))}
                            loading={teacherAvailableQuery.isLoading}
                        />
                    </Form.Item>
                </div>
                <div className="">
                    <p className="">Import Siswa</p>
                    <TableTransfer
                        titles={[studentAvailableQuery.isLoading ? "Mengambil data..." : "Seluruh Siswa SMAN 12", "Kelas Baru"]}
                        rowKey={(s: any) => s.id}
                        dataSource={studentAvailableQuery.data as any}
                        targetKeys={targetKeys}
                        showSearch
                        onChange={onChange}
                        filterOption={(inputValue, item) => {
                            return (
                                item?.nama?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1 ||
                                item?.nis?.toString().indexOf(inputValue?.toString()) !== -1 ||
                                item?.nisn?.toString().indexOf(inputValue?.toString()) !== -1
                            );
                        }}
                        leftColumns={columns}
                        rightColumns={columns}
                    />
                </div>
                <Form.Item>
                    <Button loading={createClassMutation.isLoading} type="primary" htmlType="submit" className="mt-10">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default MasterDataKelasAdd;
