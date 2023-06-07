import { Button, DatePicker, Form, Input, Select } from "antd";
import { BiArrowBack } from "react-icons/bi";
import { Link } from "react-router-dom";
import { GENDER, STUDENT_PATH } from "utils/constant";

function StudentProfileEdit() {
    const onFinish = (values: any) => {
        console.log("Success:", values);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    };

    return (
        <div className="">
            <div className="w-full flex items-center gap-4">
                <Link to={STUDENT_PATH.profile.index}>
                    <BiArrowBack className="cursor-pointer text-xl" />
                </Link>
                <h1 className="">Profil Edit</h1>
            </div>
            <img src="https://source.unsplash.com/random/?Cryptocurrency&1" alt="" className="w-[200px] h-[200px] rounded-full object-cover" />
            <Form
                initialValues={{ username: "fiqri ardiansyah" }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                layout="vertical"
                requiredMark={false}
            >
                <div className="grid w-full grid-cols-3 gap-x-5">
                    <Form.Item label="Nama" name="name" rules={[{ required: true, message: "Nama harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Handphone" name="handphone" rules={[{ required: true, message: "HP harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="NUPTK" name="nuptk" rules={[{ required: true, message: "NUPTK harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Alamat" name="address" rules={[{ required: true, message: "Alamat harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Posisi" name="position" rules={[{ required: true, message: "Posisi harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Kelamin" name="gender" rules={[{ required: true, message: "Kelamin harus diisi!" }]}>
                        <Select options={GENDER} />
                    </Form.Item>

                    <Form.Item label="Tanggal Lahir" name="dot" rules={[{ required: true, message: "Tanggal lahir harus diisi!" }]}>
                        <DatePicker className="w-full" />
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

export default StudentProfileEdit;
