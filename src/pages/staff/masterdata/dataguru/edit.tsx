import { Alert, Button, DatePicker, Form, Image, Input, Popconfirm, Select, Skeleton, Space, Upload, UploadProps, message, notification } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";

import { httpsCallable } from "firebase/functions";
import { Guru } from "modules/dataguru/table";
import { IoMdArrowBack } from "react-icons/io";
import { useMutation, useQuery } from "react-query";
import { functionInstance, storageInstance } from "service/firebase-instance";
import { FORMAT_DATE_DAYJS, GENDER, IMAGE_FALLBACK, JENJANG, KEPEGAWAIAN, STAFF_PATH } from "utils/constant";
import StateRender from "components/common/state";
import { AiOutlineUpload } from "react-icons/ai";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import dayjs from "dayjs";

function MasterDataGuruEdit() {
    const { id } = useParams();
    const [api, contextHolder] = notification.useNotification();
    const navigate = useNavigate();

    const editUser = httpsCallable(functionInstance, "editUser");
    const deleteUser = httpsCallable(functionInstance, "deleteUserWithEmail");
    const getDataUser = httpsCallable(functionInstance, "getUserWithId");

    const dataUserQuery = useQuery(["detail-teacher", id], async () => {
        return (await getDataUser({ id })).data as Guru;
    });

    const deleteMutation = useMutation(
        ["delete", id],
        async () => {
            return (await deleteUser({ email: dataUserQuery.data?.email })).data;
        },
        {
            onError(e: any) {
                message.error(e?.message);
            },
        }
    );

    const editMutation = useMutation(
        ["edit-profile-teacher", id],
        async (data: any) => {
            return (await editUser({ ...data, email: dataUserQuery.data?.email })).data;
        },
        {
            onError(e: any) {
                message.error(e?.message);
            },
        }
    );

    const confirm = () => {
        deleteMutation.mutateAsync().then(() => {
            navigate(-1);
            message.success("Data guru dihapus");
        });
    };

    const onSaveGuru = (values: Guru) => {
        editMutation
            .mutateAsync({
                ...values,
                tgl_lahir: values?.tgl_lahir ? dayjs(values?.tgl_lahir).format(FORMAT_DATE_DAYJS) : "",
            })
            .then(() => {
                navigate(-1);
                message.success("Data guru diubah");
            });
    };

    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
            const type = ["image/png", "image/jpg", "image/jpeg"];
            const typeCurrent = type.find((t) => file.type === t);
            if (!typeCurrent) {
                message.error(`${file.name} bukan gambar`);
            }
            return typeCurrent || Upload.LIST_IGNORE;
        },
        onChange: async (info) => {
            const image = info.file.originFileObj;
            if (!image) return;
            api.open({
                placement: "top",
                key: "change-image",
                message: "Ganti poto?",
                btn: (
                    <Space>
                        <Button type="link" size="small" onClick={() => api.destroy("change-image")}>
                            Batal
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            onClick={async () => {
                                api.destroy("change-image");
                                const pathRef = ref(storageInstance, `users/${new Date().getTime()}${image.name}`);
                                const imageToBuffer = await image.arrayBuffer();
                                const upload = await uploadBytes(pathRef, imageToBuffer, { contentType: image?.type });
                                const downloadUrl = await getDownloadURL(upload.ref);
                                editMutation.mutateAsync({ foto: downloadUrl }).then(() => {
                                    dataUserQuery.refetch();
                                });
                            }}
                        >
                            Ya
                        </Button>
                    </Space>
                ),
            });
        },
        multiple: false,
        maxCount: 1,
        showUploadList: false,
    };

    const clickGoBack = (e: any) => {
        e.preventDefault();
        navigate(-1);
    };

    const initialValues = {
        ...(dataUserQuery.data || {}),
        tgl_lahir: dataUserQuery.data?.tgl_lahir ? dayjs(dataUserQuery.data?.tgl_lahir) : null,
    };

    if (!id) return <Alert type="error" message="Halaman tidak ditemukan" />;

    return (
        <div className="flex flex-col gap-5">
            {contextHolder}
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to=".." onClick={clickGoBack}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Edit Guru</h1>
                </Space>
                <Popconfirm title="Hapus" description="Hapus permanen ?" onConfirm={confirm} okText="Ya" cancelText="Tidak">
                    <Button loading={deleteMutation.isLoading} danger>
                        Delete
                    </Button>
                </Popconfirm>
            </div>
            <StateRender data={dataUserQuery.data} isLoading={dataUserQuery.isLoading} isError={dataUserQuery.isError}>
                <StateRender.Data>
                    <div className="flex items-center gap-x-10 my-5">
                        {dataUserQuery.data?.foto && (
                            <Image
                                height={200}
                                width={200}
                                src={dataUserQuery.data?.foto}
                                className="!rounded-full object-cover"
                                fallback={IMAGE_FALLBACK}
                                alt={dataUserQuery.data?.nama}
                            />
                        )}
                        <Upload {...uploadProps}>
                            <Button loading={editMutation.isLoading} icon={<AiOutlineUpload />}>
                                Upload foto
                            </Button>
                        </Upload>
                    </div>
                    <Form
                        initialValues={initialValues}
                        disabled={editMutation.isLoading}
                        onFinish={onSaveGuru}
                        autoComplete="off"
                        layout="vertical"
                        requiredMark={false}
                    >
                        <div className="grid w-full grid-cols-3 gap-x-5">
                            <Form.Item label="Nama" name="nama" rules={[{ required: true, message: "Nama harus diisi!" }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="NUPTK" name="nuptk">
                                <Input disabled />
                            </Form.Item>

                            <Form.Item label="Email" name="email">
                                <Input disabled />
                            </Form.Item>

                            <Form.Item label="NIP" name="nip" rules={[{ required: true, message: "NIP harus diisi!" }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Jenis Kelamin" name="kelamin" rules={[{ required: true, message: "Jenis kelamin harus diisi!" }]}>
                                <Select options={GENDER} />
                            </Form.Item>

                            <Form.Item label="Alamat" name="alamat" rules={[{ required: true, message: "Alamat harus diisi!" }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Telepon" name="hp" rules={[{ required: true, message: "Nomor hp harus diisi!" }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Tanggal Lahir" name="tgl_lahir" rules={[{ required: true, message: "Tanggal lahir harus diisi!" }]}>
                                <DatePicker className="w-full" />
                            </Form.Item>

                            <Form.Item label="Tempat Lahir" name="tempat_lahir" rules={[{ required: true, message: "Tempat lahir harus diisi!" }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Status Kepegawaian"
                                name="status_kepegawaian"
                                rules={[{ required: true, message: "Status kepegawaian harus diisi!" }]}
                            >
                                <Select options={KEPEGAWAIAN} />
                            </Form.Item>

                            <Form.Item label="Jurusan" name="jurusan" rules={[{ required: true, message: "Jurusan harus diisi!" }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Jenjang" name="jenjang" rules={[{ required: true, message: "Jenjang pendidikan harus diisi!" }]}>
                                <Select options={JENJANG} />
                            </Form.Item>
                        </div>
                        <Form.Item>
                            <Button loading={editMutation.isLoading} type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(dataUserQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default MasterDataGuruEdit;
