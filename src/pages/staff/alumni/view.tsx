import { Alert, Card, Descriptions, Image, Skeleton } from "antd";
import CardNote, { Note } from "components/card-note";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import { GiGraduateCap } from "react-icons/gi";
import { IoMdArrowBack } from "react-icons/io";
import { useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { GENDER, IMAGE_FALLBACK } from "utils/constant";

const getNoteByStudent = httpsCallable(functionInstance, "getNoteByStudent");
const getMyData = httpsCallable(functionInstance, "getUserWithId");

function AlumniView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const getNoteByStudentQuery = useQuery(["get-note-student", id], async () => {
        return (await getNoteByStudent({ student_id: id })).data as Note[];
    });

    const profileQuery = useQuery(["profile", id], async () => {
        return (await (
            await getMyData({ id })
        ).data) as Siswa;
    });
    const clickGoBack = (e: any) => {
        e.preventDefault();
        navigate(-1);
    };

    return (
        <div className="pb-10">
            <div className="w-full flex items-center">
                <Link to=".." onClick={clickGoBack}>
                    <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                </Link>
                <h1 className="ml-3">Profil Alumni</h1>
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
                        {profileQuery.data?.kelas === "LULUS" && (
                            <div className="flex flex-col items-center justify-center">
                                <GiGraduateCap className="text-9xl text-green-400" />
                                <p className="m-0 text-green-500 font-semibold">LULUS {profileQuery.data?.lulus}</p>
                            </div>
                        )}
                    </div>
                    <Descriptions title="User Info" className="mt-10" bordered>
                        <Descriptions.Item label="Nama">{profileQuery.data?.nama}</Descriptions.Item>
                        <Descriptions.Item label="NISN">{profileQuery.data?.nisn}</Descriptions.Item>
                        <Descriptions.Item label="NIS">{profileQuery.data?.nis}</Descriptions.Item>
                        <Descriptions.Item label="Email">{profileQuery.data?.email}</Descriptions.Item>
                        <Descriptions.Item label="Telepon">{profileQuery.data?.hp}</Descriptions.Item>
                        <Descriptions.Item label="Jenis Kelamin">
                            {GENDER.find((el) => el.value === profileQuery?.data?.kelamin)?.label}
                        </Descriptions.Item>
                        <Descriptions.Item label="Alamat">{profileQuery.data?.alamat}</Descriptions.Item>
                        <Descriptions.Item label="Wali / Orang tua">{profileQuery.data?.wali}</Descriptions.Item>
                        <Descriptions.Item label="Stambuk">{profileQuery.data?.stambuk}</Descriptions.Item>
                    </Descriptions>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(profileQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
            <div className="flex flex-col gap-4 items-start mt-10">
                <div className="m-0">Catatan siswa</div>
                <Card className="!w-full">
                    <StateRender
                        data={getNoteByStudentQuery.data}
                        isLoading={getNoteByStudentQuery.isLoading}
                        isError={getNoteByStudentQuery.isError}
                    >
                        <StateRender.Data>
                            {getNoteByStudentQuery.data?.map((nt) => (
                                <CardNote roles="teacher" fetcher={getNoteByStudentQuery} key={nt.id} note={nt} />
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

export default AlumniView;
