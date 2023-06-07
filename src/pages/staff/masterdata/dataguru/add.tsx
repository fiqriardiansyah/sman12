import { Button, Form, Input, Select, Space, message } from "antd";
import { Link, useNavigate } from "react-router-dom";

import { httpsCallable } from "firebase/functions";
import { Guru } from "modules/dataguru/table";
import { IoMdArrowBack } from "react-icons/io";
import { useMutation } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { GENDER, STAFF_PATH } from "utils/constant";

function MasterDataGuruAdd() {
    const createTeacher = httpsCallable(functionInstance, "createTeacherClass");
    const navigate = useNavigate();

    const createTeacherMutate = useMutation(
        ["create-teacher"],
        async (data: Partial<Guru>) => {
            return (await createTeacher({ ...data })).data;
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

    const onSaveGuru = (values: Guru) => {
        createTeacherMutate.mutate(values);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to={STAFF_PATH.masterdata.dataguru.index}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Tambah Guru</h1>
                </Space>
            </div>
            <Form disabled={createTeacherMutate.isLoading} onFinish={onSaveGuru} autoComplete="off" layout="vertical" requiredMark={false}>
                <div className="grid w-full grid-cols-3 gap-x-5">
                    <Form.Item label="Nama" name="nama" rules={[{ required: true, message: "Nama harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="NUPTK" name="nuptk" rules={[{ required: true, message: "NUPTK harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Kelamin" name="kelamin">
                        <Select options={GENDER} />
                    </Form.Item>

                    <Form.Item label="Alamat" name="alamat">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Handphone" name="hp">
                        <Input />
                    </Form.Item>
                </div>
                <Form.Item>
                    <Button loading={createTeacherMutate.isLoading} type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default MasterDataGuruAdd;
