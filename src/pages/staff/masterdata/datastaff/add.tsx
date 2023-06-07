import { Button, Form, Input, Select, Space } from "antd";
import Layout from "components/common/layout";
import { Link } from "react-router-dom";

import { Siswa } from "modules/datasiswa/table";
import { IoMdArrowBack } from "react-icons/io";
import { GENDER, STAFF_PATH } from "utils/constant";

function MasterDataStaffAdd() {
    const onSaveGuru = (values: Siswa) => {
        console.log("Success:", values);
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
            <Form onFinish={onSaveGuru} autoComplete="off" layout="vertical" requiredMark={false}>
                <div className="grid w-full grid-cols-3 gap-x-5">
                    <Form.Item label="Nama" name="nama" rules={[{ required: true, message: "Nama harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Kelamin" name="kelamin" rules={[{ required: true, message: "Kelamin harus diisi!" }]}>
                        <Select options={GENDER} />
                    </Form.Item>

                    <Form.Item label="NUPTK" name="nuptk" rules={[{ required: true, message: "NUPTK harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Alamat" name="alamat" rules={[{ required: true, message: "Alamat harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Handphone" name="hp" rules={[{ required: true, message: "HP harus diisi!" }]}>
                        <Input />
                    </Form.Item>
                </div>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default MasterDataStaffAdd;
