import { Button, Form, Input, Select, Space, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import { IoMdArrowBack } from "react-icons/io";
import { CATEGORY_NEWS, STAFF_PATH } from "utils/constant";
import "react-quill/dist/quill.snow.css";
import { httpsCallable } from "firebase/functions";
import { functionInstance } from "service/firebase-instance";
import { useMutation } from "react-query";
import { useContext } from "react";
import { UserContext } from "context/user";

function StaffPengumumanAdd() {
    const { state } = useContext(UserContext);

    const navigate = useNavigate();
    const createNews = httpsCallable(functionInstance, "createNews");

    const createNewsMutate = useMutation(["create-news"], async (data: any) => {
        return (await createNews(data)).data;
    });

    const onSavePengumuman = (values: any) => {
        if (values.body) {
            message.error("Konten tidak boleh kosong");
            return;
        }
        createNewsMutate
            .mutateAsync({
                ...values,
                tanggal_dibuat: new Date().getTime(),
                dibuat_oleh: state?.user?.nama,
            })
            .then(() => {
                navigate(-1);
                message.success("Berhasil menambah data");
            })
            .catch((e: any) => {
                message.error(e?.message);
            });
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to={STAFF_PATH.pengumuman.index}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Buat Pengumuman</h1>
                </Space>
            </div>
            <Form onFinish={onSavePengumuman} autoComplete="off" layout="vertical" requiredMark={false}>
                <div className="flex w-full gap-x-5">
                    <Form.Item label="Judul" name="judul" rules={[{ required: true, message: "Judul harus diisi!" }]} className="w-full">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Kategori" name="category" rules={[{ required: true, message: "Kategori harus diisi!" }]} className="w-[200px]">
                        <Select options={CATEGORY_NEWS} placeholder="pilih" />
                    </Form.Item>
                </div>
                <Form.Item label="Konten" name="isi" rules={[{ required: true, message: "Konten harus diisi!" }]}>
                    <ReactQuill theme="snow" className="bg-white h-[200px]" />
                </Form.Item>
                <Form.Item className="mt-16">
                    <Button loading={createNewsMutate.isLoading} type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default StaffPengumumanAdd;
