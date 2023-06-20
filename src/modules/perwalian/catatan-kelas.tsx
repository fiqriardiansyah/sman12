import { Alert, Card, Skeleton } from "antd";
import StateRender from "components/common/state";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import VisibilitySensor from "react-visibility-sensor";
import { useMutation, useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import React from "react";
import CardNote, { Props as CardNoteProps, Note } from "components/card-note";

const getNotesByTeacher = httpsCallable(functionInstance, "getNotesByTeacher");
const noteSeenByTeacher = httpsCallable(functionInstance, "noteSeenByTeacher");

type CardNoteWithUpdateSeenProps = CardNoteProps;

function CardNoteWithUpdateSeen(props: CardNoteWithUpdateSeenProps) {
    const noteSeenByTeacherMutate = useMutation(["set-note-teacher"], async (id: any) => {
        return (await noteSeenByTeacher({ id })).data as any;
    });

    const onChangeVisibilityNote = (isSeen: boolean) => {
        if (isSeen && !props?.note.teacher_seen) {
            noteSeenByTeacherMutate.mutate(props?.note?.id);
        }
    };

    return (
        <VisibilitySensor scrollCheck="true" onChange={onChangeVisibilityNote}>
            <CardNote {...props} />
        </VisibilitySensor>
    );
}

function CatatanKelas() {
    const { state } = React.useContext(UserContext);

    const getNotesByTeacherQuery = useQuery(["get-note-class"], async () => {
        return (await getNotesByTeacher({ kelas_id: state?.user?.kelas_id })).data as Note[];
    });

    return (
        <Card className="max-h-[600px] overflow-y-auto">
            <StateRender data={getNotesByTeacherQuery.data} isLoading={getNotesByTeacherQuery.isLoading} isError={getNotesByTeacherQuery.isError}>
                <StateRender.Data>
                    {getNotesByTeacherQuery?.data?.map((note) => (
                        <CardNoteWithUpdateSeen fetcher={getNotesByTeacherQuery} note={note} key={note.id} roles="teacher" />
                    ))}
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(getNotesByTeacherQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </Card>
    );
}

export default CatatanKelas;
