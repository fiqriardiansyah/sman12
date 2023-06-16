import { Alert, Button, Card, Descriptions, Image, Input, Skeleton, Space, message } from "antd";
import CardNote, { Note } from "components/card-note";
import StateRender from "components/common/state";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import React from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useMutation, useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { GENDER, IMAGE_FALLBACK } from "utils/constant";

const createNoteToStudent = httpsCallable(functionInstance, "createNoteToStudent");
const getNoteByStudent = httpsCallable(functionInstance, "getNoteByStudent");
const getDataUser = httpsCallable(functionInstance, "getUserWithId");

function TeacherDaftarSiswaDetail() {
    const { id } = useParams();
    const { state } = React.useContext(UserContext);
    const [note, setNote] = React.useState("");

    const navigate = useNavigate();

    const getNoteByStudentQuery = useQuery(["get-note", id], async () => {
        return (await getNoteByStudent({ student_id: id })).data as Note[];
    });

    const noteToStudentMutate = useMutation(["note-to-student"], async (data: any) => {
        return (await createNoteToStudent(data)).data;
    });

    const dataUserQuery = useQuery(["detail-student", id], async () => {
        return (await getDataUser({ id })).data as Siswa;
    });

    const clickGoBack = (e: any) => {
        e.preventDefault();
        navigate(-1);
    };

    const onSendNote = () => {
        const data = {
            note,
            student_id: id,
            sender_id: state?.user?.id,
            send_date: new Date().getTime(),
        };
        noteToStudentMutate
            .mutateAsync(data)
            .then(() => {
                message.success("Catatan terkirim");
            })
            .finally(() => {
                getNoteByStudentQuery.refetch();
            });
        setNote("");
    };

    if (!id) return <Alert type="error" message="Halaman tidak ditemukan" />;

    return (
        <div className="flex flex-col gap-5 pb-10">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to=".." onClick={clickGoBack}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Detail Siswa</h1>
                </Space>
            </div>
            <StateRender data={dataUserQuery.data} isLoading={dataUserQuery.isLoading} isError={dataUserQuery.isError}>
                <StateRender.Data>
                    <Image
                        height={200}
                        width={200}
                        src={dataUserQuery.data?.foto}
                        className="!rounded-full object-cover"
                        fallback={IMAGE_FALLBACK}
                        alt={dataUserQuery.data?.nama}
                    />
                    <Descriptions title="Data siswa" className="mt-10" bordered>
                        <Descriptions.Item label="Nama">{dataUserQuery.data?.nama}</Descriptions.Item>
                        <Descriptions.Item label="NISN">{dataUserQuery.data?.nisn}</Descriptions.Item>
                        <Descriptions.Item label="NIS">{dataUserQuery.data?.nis}</Descriptions.Item>
                        <Descriptions.Item label="Email">{dataUserQuery.data?.email}</Descriptions.Item>
                        <Descriptions.Item label="Handphone">{dataUserQuery.data?.hp}</Descriptions.Item>
                        <Descriptions.Item label="Jenis Kelamin">
                            {GENDER.find((el) => el.value === dataUserQuery?.data?.kelamin)?.label}
                        </Descriptions.Item>
                        <Descriptions.Item label="Alamat">{dataUserQuery.data?.alamat}</Descriptions.Item>
                        <Descriptions.Item label="Wali">{dataUserQuery.data?.wali}</Descriptions.Item>
                        <Descriptions.Item label="Kelas">{dataUserQuery.data?.kelas}</Descriptions.Item>
                    </Descriptions>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(dataUserQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
            <div className="flex flex-col gap-4 items-start">
                <p className="m-0">Catatan siswa</p>
                <Input.TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis Catatan..." allowClear />
                <Button disabled={!note} onClick={onSendNote} loading={noteToStudentMutate.isLoading}>
                    Kirim
                </Button>
                <Card className="!w-full">
                    <StateRender
                        data={getNoteByStudentQuery.data}
                        isLoading={getNoteByStudentQuery.isLoading}
                        isError={getNoteByStudentQuery.isError}
                    >
                        <StateRender.Data>
                            {getNoteByStudentQuery.data?.map((nt) => (
                                <CardNote fetcher={getNoteByStudentQuery} key={nt.id} note={nt} />
                            ))}
                            {!getNoteByStudentQuery.data?.length ? <p className="text-xl">Tidak ada catatan</p> : null}
                        </StateRender.Data>
                        <StateRender.Loading>
                            <Skeleton />
                        </StateRender.Loading>
                        <StateRender.Error>
                            <Alert type="error" message={(getNoteByStudentQuery.error as any)?.message} />
                        </StateRender.Error>
                    </StateRender>
                </Card>
            </div>
        </div>
    );
}

export default TeacherDaftarSiswaDetail;
