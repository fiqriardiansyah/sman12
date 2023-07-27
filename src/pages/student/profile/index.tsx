import { Alert, Card, Descriptions, Image, Skeleton, Tag } from "antd";
import CardNote, { Note } from "components/card-note";
import StateRender from "components/common/state";
import VisibilitySensor from "react-visibility-sensor";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import { Kelas } from "modules/datakelas/table";
import { Siswa } from "modules/datasiswa/table";
import { GiGraduateCap } from "react-icons/gi";
import { useContext } from "react";
import { FaRegEdit } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { FORMATE_DATE_TIME, FORMAT_DATE, GENDER, IMAGE_FALLBACK, STUDENT_PATH } from "utils/constant";
import moment from "moment";

const getNoteByStudent = httpsCallable(functionInstance, "getNoteByStudent");
const noteSeenByStudent = httpsCallable(functionInstance, "noteSeenByStudent");
const getMyData = httpsCallable(functionInstance, "getUserWithEmail");
const detailClass = httpsCallable(functionInstance, "detailClass");

function StudentProfile() {
    const { state } = useContext(UserContext);
    const queryClient = useQueryClient();

    const detailClassQuery = useQuery(["get-class", state?.user?.kelas], async () => {
        return (await detailClass({ id: state?.user?.kelas_id })).data as Kelas;
    });

    const getNoteByStudentQuery = useQuery(["get-note-student", state?.user?.id], async () => {
        return (await getNoteByStudent({ student_id: state?.user?.id })).data as Note[];
    });

    const seenNoteStudentMutate = useMutation(["seen-note-student", state?.user?.id], async (notes: Note[] | undefined) => {
        return (await noteSeenByStudent({ notes })).data as Note[];
    });

    const profileQuery = useQuery(["profile", state?.user?.uid], async () => {
        return (await (
            await getMyData({ email: state?.user?.email })
        ).data) as Siswa;
    });

    const onChangeVisibilityNote = (isSeen: boolean) => {
        const notes = getNoteByStudentQuery.data?.filter((el) => !el?.receiver_seen);
        if (isSeen && notes?.length) {
            seenNoteStudentMutate.mutateAsync(notes).then(() => {
                setTimeout(() => {
                    queryClient.invalidateQueries("get-note-student");
                }, 1000);
            });
        }
    };

    const totalUnseenNote = getNoteByStudentQuery.data?.filter((el) => !el?.receiver_seen).length || 0;

    return (
        <div className="pb-10">
            <div className="w-full flex items-center justify-between">
                <h1>Profil</h1>
                <Link to={STUDENT_PATH.profile.edit}>
                    <FaRegEdit title="edit profil" className="cursor-pointer text-lg" />
                </Link>
            </div>
            <StateRender data={profileQuery.data} isLoading={profileQuery.isLoading} isError={profileQuery.isError}>
                <StateRender.Data>
                    <div className="w-full flex items-center justify-between">
                        <Image
                            height={200}
                            width={200}
                            src={profileQuery.data?.foto}
                            className="!rounded-full object-cover"
                            fallback={IMAGE_FALLBACK}
                            alt={profileQuery.data?.nama}
                        />
                        {state?.user?.kelas === "LULUS" && (
                            <div className="flex flex-col items-center justify-center">
                                <GiGraduateCap className="text-9xl text-green-400" />
                                <p className="m-0 text-green-500 font-semibold">LULUS {state?.user?.lulus}</p>
                            </div>
                        )}
                    </div>
                    <Descriptions title="User Info" className="mt-10" bordered>
                        <Descriptions.Item label="Nama">{profileQuery.data?.nama}</Descriptions.Item>
                        <Descriptions.Item label="NIS">{profileQuery.data?.nis}</Descriptions.Item>
                        <Descriptions.Item label="NISN">{profileQuery.data?.nisn}</Descriptions.Item>
                        <Descriptions.Item label="Email">{profileQuery.data?.email}</Descriptions.Item>
                        <Descriptions.Item label="Telepon">{profileQuery.data?.hp}</Descriptions.Item>
                        <Descriptions.Item label="Jenis Kelamin">
                            {GENDER.find((el) => el.value === profileQuery?.data?.kelamin)?.label}
                        </Descriptions.Item>
                        <Descriptions.Item label="Alamat">{profileQuery.data?.alamat}</Descriptions.Item>
                        <Descriptions.Item label="Wali/Orang tua">{profileQuery.data?.wali}</Descriptions.Item>
                        <Descriptions.Item label="Telepon Wali/Orang tua">{profileQuery.data?.hp_wali}</Descriptions.Item>
                        <Descriptions.Item label="Stambuk">{profileQuery.data?.stambuk}</Descriptions.Item>
                        <Descriptions.Item label="Tgl lahir">
                            {profileQuery.data?.tgl_lahir ? moment(profileQuery.data?.tgl_lahir, FORMATE_DATE_TIME).format(FORMAT_DATE) : ""}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tempat lahir">{profileQuery.data?.tempat_lahir}</Descriptions.Item>
                    </Descriptions>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(profileQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
            {state?.user?.kelas && state?.user?.kelas !== "LULUS" ? (
                <div className="flex flex-col gap-4 items-start mt-10">
                    <p className="m-0">Detail Kelas</p>
                    <Card className="!w-full">
                        <Descriptions>
                            <Descriptions.Item label="Wali Kelas">{detailClassQuery?.data?.wali_nama}</Descriptions.Item>
                            <Descriptions.Item label="Kelas">{state?.user?.kelas}</Descriptions.Item>
                            <Descriptions.Item label="Jumlah siswa">{detailClassQuery?.data?.murid?.length} siswa</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </div>
            ) : null}
            <div className="flex flex-col gap-4 items-start mt-10">
                <div className="m-0">Catatan siswa {totalUnseenNote ? <Tag color="red">{totalUnseenNote} Baru</Tag> : null}</div>
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
                            <VisibilitySensor scrollCheck="true" onChange={onChangeVisibilityNote}>
                                <div className="h-1 w-full" />
                            </VisibilitySensor>
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

export default StudentProfile;
