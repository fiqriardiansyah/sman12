import { Button, Form, Input, Select, Space, message } from "antd";
import { Link, useNavigate } from "react-router-dom";

import { httpsCallable } from "firebase/functions";
import { Guru } from "modules/dataguru/table";
import { IoMdArrowBack } from "react-icons/io";
import { useMutation, useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { STAFF_PATH } from "utils/constant";

export interface Pelajaran {
    id?: string;
    guru_id?: string;
    guru_nama?: string;
    mata_pelajaran?: string;
}

function MasterDataPelajaranAdd() {
    const navigate = useNavigate();
    const createSubject = httpsCallable(functionInstance, "createSubject");
    const getTeachers = httpsCallable(functionInstance, "getTeachers");

    const teacherAvailableQuery = useQuery(["get-teacher"], async () => {
        return (await getTeachers()).data as Guru[];
    });

    const createSubjectMutate = useMutation(
        ["create-subject"],
        async (data: Partial<Pelajaran>) => {
            return (await createSubject({ ...data })).data;
        },
        {
            onSuccess(data) {
                navigate(-1);
                message.success("Berhasil menambahkan data");
            },
            onError(error: any) {
                message.error(error?.message);
            },
        }
    );

    const onSaveSubject = (values: any) => {
        createSubjectMutate.mutate({
            mata_pelajaran: values.nama,
            guru_id: values.guru,
            guru_nama: teacherAvailableQuery.data?.find((guru) => guru.id === values.guru)?.nama,
        });
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to={STAFF_PATH.masterdata.datapelajaran.index}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Tambah Pelajaran</h1>
                </Space>
            </div>
            <Form disabled={createSubjectMutate.isLoading} onFinish={onSaveSubject} autoComplete="off" layout="vertical" requiredMark={false}>
                <div className="grid w-full grid-cols-3 gap-x-5">
                    <Form.Item label="Nama pelajaran" name="nama" rules={[{ required: true, message: "Nama pelajaran harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Guru Pengajar" name="guru" rules={[{ required: true, message: "Guru pengajar belum dipilih" }]}>
                        <Select
                            showSearch
                            options={teacherAvailableQuery.data?.map((t) => ({ label: t.nama, value: t.id }))}
                            loading={teacherAvailableQuery.isLoading}
                        />
                    </Form.Item>
                </div>
                <Form.Item>
                    <Button loading={createSubjectMutate.isLoading} type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default MasterDataPelajaranAdd;
