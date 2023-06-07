import { Button, Form, Input, Space } from "antd";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import { IoMdArrowBack } from "react-icons/io";
import { STAFF_PATH } from "utils/constant";
import "react-quill/dist/quill.snow.css";

function StaffPengumumanEdit() {
    const onSavePengumuman = (values: any) => {
        console.log("Success:", values);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to={STAFF_PATH.pengumuman.index}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Edit Pengumuman</h1>
                </Space>
            </div>
            <Form onFinish={onSavePengumuman} autoComplete="off" layout="vertical" requiredMark={false}>
                <Form.Item label="Judul" name="judul" rules={[{ required: true, message: "judul harus diisi!" }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Konten" name="content" rules={[{ required: true, message: "Konten harus diisi!" }]}>
                    <ReactQuill theme="snow" className="bg-white h-[200px]" />
                </Form.Item>
                <Form.Item className="mt-16">
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default StaffPengumumanEdit;
