import { Alert, Card, Descriptions, Image, Skeleton } from "antd";
import CardNote, { Note } from "components/card-note";
import StateRender from "components/common/state";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import { Kelas } from "modules/datakelas/table";
import { Siswa } from "modules/datasiswa/table";
import { useContext } from "react";
import { FaRegEdit } from "react-icons/fa";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { GENDER, IMAGE_FALLBACK, STUDENT_PATH } from "utils/constant";

const getNoteByStudent = httpsCallable(functionInstance, "getNoteByStudent");

function StudentProfile() {
    const { state } = useContext(UserContext);
    const getMyData = httpsCallable(functionInstance, "getUserWithEmail");
    const detailClass = httpsCallable(functionInstance, "detailClass");

    const detailClassQuery = useQuery(["get-class", state?.user?.kelas], async () => {
        return (await detailClass({ id: state?.user?.kelas_id })).data as Kelas;
    });

    const getNoteByStudentQuery = useQuery(["get-note", state?.user?.id], async () => {
        return (await getNoteByStudent({ student_id: state?.user?.id })).data as Note[];
    });

    const profileQuery = useQuery(["profile", state?.user?.uid], async () => {
        return (await (
            await getMyData({ email: state?.user?.email })
        ).data) as Siswa;
    });

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
                    <Image
                        height={200}
                        width={200}
                        src={profileQuery.data?.foto}
                        className="!rounded-full object-cover"
                        fallback={IMAGE_FALLBACK}
                        alt={profileQuery.data?.nama}
                    />
                    <Descriptions title="User Info" className="mt-10" bordered>
                        <Descriptions.Item label="Nama">{profileQuery.data?.nama}</Descriptions.Item>
                        <Descriptions.Item label="NISN">{profileQuery.data?.nisn}</Descriptions.Item>
                        <Descriptions.Item label="NIS">{profileQuery.data?.nis}</Descriptions.Item>
                        <Descriptions.Item label="Email">{profileQuery.data?.email}</Descriptions.Item>
                        <Descriptions.Item label="Handphone">{profileQuery.data?.hp}</Descriptions.Item>
                        <Descriptions.Item label="Jenis Kelamin">
                            {GENDER.find((el) => el.value === profileQuery?.data?.kelamin)?.label}
                        </Descriptions.Item>
                        <Descriptions.Item label="Alamat">{profileQuery.data?.alamat}</Descriptions.Item>
                        <Descriptions.Item label="Wali / Orang tua">{profileQuery.data?.wali}</Descriptions.Item>
                    </Descriptions>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(profileQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
            {state?.user?.kelas ? (
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
                <p className="m-0">Catatan siswa</p>
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

export default StudentProfile;
