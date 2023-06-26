import { Alert, Button, DatePicker, Form, Image, Input, Select, Skeleton, Space, Upload, UploadProps, message, notification } from "antd";
import StateRender from "components/common/state";
import { UserContext } from "context/user";
import dayjs from "dayjs";
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Guru } from "modules/dataguru/table";
import React from "react";
import { AiOutlineUpload } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { useMutation, useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { functionInstance, storageInstance } from "service/firebase-instance";
import { DEFAULT_ERROR_MESSAGE, FORMAT_DATE_DAYJS, GENDER, IMAGE_FALLBACK, JENJANG, KEPEGAWAIAN, STUDENT_PATH } from "utils/constant";

function TeacherProfileEdit() {
    const { state } = React.useContext(UserContext);
    const getMyData = httpsCallable(functionInstance, "getUserWithEmail");
    const editUser = httpsCallable(functionInstance, "editUser");

    const [api, contextHolder] = notification.useNotification();

    const navigate = useNavigate();

    const profileQuery = useQuery(["profile", state?.user?.uid], async () => {
        return (await (
            await getMyData({ email: state?.user?.email })
        ).data) as Guru;
    });

    const editMutation = useMutation(
        ["edit-profile"],
        async (data: any) => {
            return (await editUser({ ...data, email: state?.user?.email })).data;
        },
        {
            onError() {
                message.error(DEFAULT_ERROR_MESSAGE);
            },
        }
    );

    const onFinish = async (values: any) => {
        await editMutation
            .mutateAsync({
                ...values,
                tgl_lahir: values?.tgl_lahir ? dayjs(values?.tgl_lahir).format(FORMAT_DATE_DAYJS) : "",
            })
            .then(() => {
                message.success("edit profile berhasil");
                navigate(-1);
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
                message: "Ganti poto profil?",
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
                                    profileQuery.refetch();
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

    const initialValues = {
        ...(profileQuery.data || {}),
        tgl_lahir: profileQuery.data?.tgl_lahir ? dayjs(profileQuery.data?.tgl_lahir) : null,
    };

    return (
        <div className="">
            {contextHolder}
            <div className="w-full flex items-center gap-4">
                <Link to={STUDENT_PATH.profile.index}>
                    <BiArrowBack className="cursor-pointer text-xl" />
                </Link>
                <h1 className="">Profil Edit</h1>
            </div>
            <StateRender data={profileQuery.data} isLoading={profileQuery.isLoading} isError={profileQuery.isError}>
                <StateRender.Data>
                    <div className="flex items-center gap-x-10 my-5">
                        {profileQuery.data?.foto && (
                            <Image
                                height={200}
                                width={200}
                                src={profileQuery.data?.foto}
                                className="!rounded-full object-cover"
                                fallback={IMAGE_FALLBACK}
                                alt={profileQuery.data?.nama}
                            />
                        )}
                        <Upload {...uploadProps}>
                            <Button loading={editMutation.isLoading} icon={<AiOutlineUpload />}>
                                Upload foto
                            </Button>
                        </Upload>
                    </div>
                    <Form initialValues={initialValues} onFinish={onFinish} autoComplete="off" layout="vertical" requiredMark={false}>
                        <div className="grid w-full grid-cols-3 gap-x-5">
                            <Form.Item label="Nama" name="nama" rules={[{ required: true, message: "Nama harus diisi!" }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Email" name="email">
                                <Input disabled />
                            </Form.Item>

                            <Form.Item label="NUPTK" name="nuptk">
                                <Input disabled />
                            </Form.Item>

                            <Form.Item label="NIP" name="nip">
                                <Input />
                            </Form.Item>

                            <Form.Item label="Handphone" name="hp">
                                <Input />
                            </Form.Item>

                            <Form.Item label="Alamat" name="alamat">
                                <Input />
                            </Form.Item>

                            <Form.Item label="Jenis Kelamin" name="kelamin">
                                <Select options={GENDER} />
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
                    <Alert type="error" message={(profileQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default TeacherProfileEdit;
