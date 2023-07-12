import { Alert, Button, Form, Input, Select, Skeleton, Space, message } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";

import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import { Guru } from "modules/dataguru/table";
import { IoMdArrowBack } from "react-icons/io";
import { useMutation, useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { Pelajaran } from "./add";

function MasterDataPelajaranEdit() {
    const { id } = useParams();

    const navigate = useNavigate();
    const editSubject = httpsCallable(functionInstance, "editSubject");
    const getTeachers = httpsCallable(functionInstance, "getTeachers");
    const detailSubject = httpsCallable(functionInstance, "detailSubject");

    const detailSubjectQuery = useQuery(["get-subject", id], async () => {
        return (await detailSubject({ id })).data as Pelajaran;
    });

    const teacherAvailableQuery = useQuery(["get-teacher"], async () => {
        return (await getTeachers()).data as Guru[];
    });

    const editSubjectMutate = useMutation(
        ["edit-subject"],
        async (data: any) => {
            return (await editSubject(data)).data;
        },
        {
            onSuccess(data) {
                navigate(-1);
                message.success("Berhasil mengubah data");
            },
            onError(error: any) {
                message.error(error?.message);
            },
        }
    );

    const onSaveSubject = (values: any) => {
        editSubjectMutate.mutate({
            id,
            update: {
                mata_pelajaran: values.nama,
                guru_id: values?.guru || "",
                guru_nama: teacherAvailableQuery.data?.find((guru) => guru.id === values.guru)?.nama || "",
            },
        });
    };

    const initialValues = {
        nama: detailSubjectQuery.data?.mata_pelajaran,
        guru: detailSubjectQuery.data?.guru_id,
    };

    const clickGoBack = (e: any) => {
        e.preventDefault();
        navigate(-1);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to=".." onClick={clickGoBack}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Edit Pelajaran</h1>
                </Space>
            </div>
            <StateRender data={detailSubjectQuery.data} isLoading={detailSubjectQuery.isLoading} isError={detailSubjectQuery.isError}>
                <StateRender.Data>
                    <Form
                        initialValues={initialValues}
                        disabled={editSubjectMutate.isLoading}
                        onFinish={onSaveSubject}
                        autoComplete="off"
                        layout="vertical"
                        requiredMark={false}
                    >
                        <div className="grid w-full grid-cols-3 gap-x-5">
                            <Form.Item label="Mata pelajaran" name="nama" rules={[{ required: true, message: "Mata pelajaran harus diisi!" }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Guru Pengajar" name="guru">
                                <Select
                                    showSearch
                                    options={teacherAvailableQuery.data?.map((t) => ({ label: t.nama, value: t.id }))}
                                    loading={teacherAvailableQuery.isLoading}
                                />
                            </Form.Item>
                        </div>
                        <Form.Item>
                            <Button loading={editSubjectMutate.isLoading} type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(detailSubjectQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default MasterDataPelajaranEdit;
