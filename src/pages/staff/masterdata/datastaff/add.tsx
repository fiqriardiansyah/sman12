import { Button, Form, Input, Select, Space, message } from "antd";
import Layout from "components/common/layout";
import { Link, useNavigate } from "react-router-dom";

import { Siswa } from "modules/datasiswa/table";
import { IoMdArrowBack } from "react-icons/io";
import { GENDER, STAFF_PATH } from "utils/constant";
import { httpsCallable } from "firebase/functions";
import { functionInstance } from "service/firebase-instance";
import { useMutation } from "react-query";
import { Staff } from "modules/datastaff/table";

function MasterDataStaffAdd() {
    const createStaff = httpsCallable(functionInstance, "createStaff");
    const navigate = useNavigate();

    const createStaffMutation = useMutation(
        ["create-staff"],
        async (data: Partial<Staff>) => {
            return (await createStaff({ ...data })).data;
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

    const onSaveStaff = (values: Staff) => {
        createStaffMutation.mutate(values);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to={STAFF_PATH.masterdata.datastaff.index}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Tambah Staff</h1>
                </Space>
            </div>
            <Form disabled={createStaffMutation.isLoading} onFinish={onSaveStaff} autoComplete="off" layout="vertical" requiredMark={false}>
                <div className="grid w-full grid-cols-3 gap-x-5">
                    <Form.Item label="Nama" name="nama" rules={[{ required: true, message: "Nama harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="NUPTK" name="nuptk" rules={[{ required: true, message: "NUPTK harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Jenis Kelamin" name="kelamin">
                        <Select options={GENDER} />
                    </Form.Item>

                    <Form.Item label="Alamat" name="alamat">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Handphone" name="hp">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Posisi" name="posisi">
                        <Input />
                    </Form.Item>
                </div>
                <Form.Item>
                    <Button loading={createStaffMutation.isLoading} type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default MasterDataStaffAdd;
