import { Alert, Button, Card, Input, Skeleton, message } from "antd";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import { useMutation, useQuery } from "react-query";
import { useParams } from "react-router-dom";
import React from "react";
import { functionInstance } from "service/firebase-instance";
import { UserContext } from "context/user";
import CardNote, { Note } from "components/card-note";

const createNoteToStudent = httpsCallable(functionInstance, "createNoteToStudent");
const getNoteByStudent = httpsCallable(functionInstance, "getNoteByStudent");

function Catatan() {
    const { id } = useParams();
    const { state } = React.useContext(UserContext);
    const [note, setNote] = React.useState("");

    const getNoteByStudentQuery = useQuery(["get-note", id], async () => {
        return (await getNoteByStudent({ student_id: id })).data as Note[];
    });

    const noteToStudentMutate = useMutation(["note-to-student"], async (data: any) => {
        return (await createNoteToStudent(data)).data;
    });

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

    return (
        <div className="flex flex-col gap-4 items-start">
            <p className="m-0">Tambah Catatan siswa</p>
            <Input.TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis Catatan..." allowClear />
            <Button disabled={!note} onClick={onSendNote} loading={noteToStudentMutate.isLoading}>
                Kirim
            </Button>
            <Card className="!w-full">
                <StateRender data={getNoteByStudentQuery.data} isLoading={getNoteByStudentQuery.isLoading} isError={getNoteByStudentQuery.isError}>
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
    );
}

export default Catatan;
