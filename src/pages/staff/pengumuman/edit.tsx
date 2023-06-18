import { Alert, Button, Descriptions, Form, Input, Popconfirm, Select, Skeleton, Space, message, notification } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import { IoMdArrowBack } from "react-icons/io";
import { CATEGORY_NEWS, FORMATE_DATE_TIME, STAFF_PATH } from "utils/constant";
import "react-quill/dist/quill.snow.css";
import { useMutation, useQuery } from "react-query";
import { httpsCallable } from "firebase/functions";
import { functionInstance } from "service/firebase-instance";
import StateRender from "components/common/state";
import { Pengumuman } from "modules/pengumuman/table";
import moment from "moment";
import { useContext } from "react";
import { UserContext } from "context/user";

function StaffPengumumanEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useContext(UserContext);

    const detailNews = httpsCallable(functionInstance, "detailNews");
    const editNews = httpsCallable(functionInstance, "editNews");
    const deleteNews = httpsCallable(functionInstance, "deleteNews");

    const detailQuery = useQuery(["get-pengumuman", id], async () => {
        return (await detailNews({ id })).data as Pengumuman;
    });

    const editMutate = useMutation(["edit-pengumuman"], async (data: any) => {
        return (await editNews(data)).data;
    });

    const deleteMutate = useMutation(["delete-pengumuman"], async () => {
        return (await deleteNews({ id })).data;
    });

    const onSavePengumuman = (values: any) => {
        editMutate
            .mutateAsync({
                ...values,
                id,
                edit_oleh: state?.user?.nama,
                tanggal_edit: new Date().getTime(),
            })
            .then(() => {
                navigate(-1);
                message.success("Berhasil mengubah data");
            })
            .catch((e: any) => {
                message.error(e?.message);
            });
    };

    const confirm = () => {
        deleteMutate.mutateAsync().then(() => {
            navigate(-1);
            message.success("Data dihapus");
        });
    };

    const initialValues = {
        judul: detailQuery.data?.judul,
        isi: detailQuery.data?.isi,
        category: detailQuery.data?.category,
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
                <Popconfirm title="Hapus" description="Hapus permanen ?" onConfirm={confirm} okText="Ya" cancelText="Tidak">
                    <Button loading={deleteMutate.isLoading} danger>
                        Delete
                    </Button>
                </Popconfirm>
            </div>
            <StateRender data={detailQuery.data} isLoading={detailQuery.isLoading} isError={detailQuery.isError}>
                <StateRender.Data>
                    <Descriptions title="Detail pengumuman" className="mt-10" bordered column={2}>
                        <Descriptions.Item label="Dibuat oleh">{detailQuery.data?.dibuat_oleh}</Descriptions.Item>
                        <Descriptions.Item label="Tanggal dibuat">
                            {moment(detailQuery.data?.tanggal_dibuat).format(FORMATE_DATE_TIME)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Diedit oleh">{detailQuery.data?.edit_oleh || ""}</Descriptions.Item>
                        <Descriptions.Item label="Tanggal diedit">
                            {detailQuery.data?.tanggal_edit ? moment(detailQuery.data?.tanggal_edit).format(FORMATE_DATE_TIME) : ""}
                        </Descriptions.Item>
                    </Descriptions>
                    <Form initialValues={initialValues} onFinish={onSavePengumuman} autoComplete="off" layout="vertical" requiredMark={false}>
                        <div className="flex w-full gap-x-5">
                            <Form.Item label="Judul" name="judul" rules={[{ required: true, message: "Judul harus diisi!" }]} className="w-full">
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Kategori"
                                name="category"
                                rules={[{ required: true, message: "Kategori harus diisi!" }]}
                                className="w-[200px]"
                            >
                                <Select options={CATEGORY_NEWS} placeholder="pilih" />
                            </Form.Item>
                        </div>
                        <Form.Item label="Konten" name="isi" rules={[{ required: true, message: "Konten harus diisi!" }]}>
                            <ReactQuill theme="snow" className="bg-white h-[500px]" />
                        </Form.Item>
                        <Form.Item className="mt-16">
                            <Button loading={editMutate.isLoading} type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(detailQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default StaffPengumumanEdit;
