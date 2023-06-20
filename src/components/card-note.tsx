/* eslint-disable no-nested-ternary */
import { Button, Input, Space, Spin } from "antd";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import { Guru } from "modules/dataguru/table";
import moment from "moment";
import React from "react";
import { AiFillDelete, AiOutlineEdit } from "react-icons/ai";
import { UseQueryResult, useMutation, useQuery } from "react-query";
import { Link } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { FORMATE_DATE_TIME } from "utils/constant";

export type Note = {
    id?: string;
    note: string;
    student_id: string;
    student_name?: string;
    sender_id: string;
    send_date: any;
    teacher_seen?: boolean;
    receiver_seen?: boolean;
};

export type Props = { note: Note; fetcher?: UseQueryResult<Note[], unknown>; roles?: "student" | "teacher" };

const editNoteToStudent = httpsCallable(functionInstance, "editNoteToStudent");
const deleteNoteToStudent = httpsCallable(functionInstance, "deleteNoteToStudent");
const getTeachers = httpsCallable(functionInstance, "getTeachers");

function CardNote({ note, fetcher, roles = "student" }: Props) {
    const { state } = React.useContext(UserContext);
    const [edit, setEdit] = React.useState<any>(null);

    const teacherQuery = useQuery(["get-teacher"], async () => {
        return (await getTeachers()).data as Guru[];
    });

    const editNoteToStudentMutate = useMutation(["edit-note", note?.id], async (data: Note) => {
        return (await editNoteToStudent(data)).data;
    });

    const deleteNoteToStudentMutate = useMutation(["edit-note", note?.id], async (id: any) => {
        return (await deleteNoteToStudent({ id })).data;
    });

    const onClickEdit = () => {
        setEdit(note);
    };

    const onCancelEdit = () => {
        setEdit(null);
    };

    const onChange = (e: any) => {
        setEdit((prev: Note) => ({
            note: e.target.value,
            id: prev?.id,
            student_id: prev?.student_id,
            sender_id: prev?.sender_id,
            send_date: prev?.send_date,
        }));
    };

    const onSave = () => {
        editNoteToStudentMutate.mutateAsync(edit!).finally(() => {
            setEdit(null);
            fetcher?.refetch();
        });
    };

    const onDelete = () => {
        deleteNoteToStudentMutate.mutateAsync(note.id).finally(() => {
            fetcher?.refetch();
        });
    };

    return (
        <div
            className={`p-2 flex hover:bg-slate-100 gap-4 items-start duration-300 transition-colors ${
                roles === "student"
                    ? !note?.receiver_seen
                        ? "bg-red-100"
                        : ""
                    : !note?.teacher_seen && state?.user?.id !== note?.sender_id
                    ? "bg-red-100"
                    : ""
            }`}
            style={{ borderBottom: "1px solid #c9c9c9" }}
        >
            <div className="w-full">
                {edit ? (
                    <Input.TextArea value={edit.note} onChange={onChange} placeholder="Tulis Catatan..." allowClear />
                ) : (
                    <p className="m-0 text-lg">{note.note}</p>
                )}
                <span className="italic text-xs text-gray-400 capitalize">
                    Pengirim: {teacherQuery.data?.find((teacher) => teacher.id === note.sender_id)?.nama} -{" "}
                    {moment(note.send_date).format(FORMATE_DATE_TIME)}
                </span>
                {note?.student_name ? (
                    <Link to={`/siswa/${note.student_id}`}>
                        <p className="m-0 capitalize text-xs">Kepada: {note?.student_name}</p>
                    </Link>
                ) : null}
            </div>
            {state?.user?.id === note?.sender_id && (
                <div className="">
                    {edit ? (
                        <Space>
                            <Button onClick={onSave} loading={editNoteToStudentMutate.isLoading} size="small" disabled={!edit.note}>
                                Simpan
                            </Button>
                            <Button onClick={onCancelEdit} size="small" danger>
                                Batal
                            </Button>
                        </Space>
                    ) : (
                        <Space>
                            {deleteNoteToStudentMutate.isLoading ? (
                                <Spin size="small" />
                            ) : (
                                <AiFillDelete onClick={onDelete} className="text-red-400 text-xl cursor-pointer" title="Hapus" />
                            )}
                            <AiOutlineEdit onClick={onClickEdit} className="text-xl cursor-pointer" title="Edit" />
                        </Space>
                    )}
                </div>
            )}
        </div>
    );
}

export default CardNote;
