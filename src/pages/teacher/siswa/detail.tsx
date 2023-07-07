import { Alert, Card, Descriptions, Image, Skeleton, Space, Tabs, TabsProps } from "antd";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import Administrasi from "modules/perwalian/administrasi";
import Akademik from "modules/perwalian/akademik";
import Catatan from "modules/perwalian/catatan";
import { IoMdArrowBack } from "react-icons/io";
import { useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { GENDER, IMAGE_FALLBACK } from "utils/constant";

const getDataUser = httpsCallable(functionInstance, "getUserWithId");

function TeacherDaftarSiswaDetail() {
    const { id } = useParams();

    const navigate = useNavigate();

    const dataUserQuery = useQuery(["detail-student", id], async () => {
        return (await getDataUser({ id })).data as Siswa;
    });

    const clickGoBack = (e: any) => {
        e.preventDefault();
        navigate(-1);
    };

    const items: TabsProps["items"] = [
        {
            key: "catatan",
            label: "Catatan",
            children: <Catatan />,
        },
        {
            key: "akademik",
            label: "Akademik",
            children: <Akademik kelas={dataUserQuery.data?.kelas} />,
        },
        {
            key: "administrasi",
            label: "Administrasi",
            children: <Administrasi kelas={dataUserQuery.data?.kelas} studentId={id} />,
        },
    ];

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
                        <Descriptions.Item label="Telepon">{dataUserQuery.data?.hp}</Descriptions.Item>
                        <Descriptions.Item label="Jenis Kelamin">
                            {GENDER.find((el) => el.value === dataUserQuery?.data?.kelamin)?.label}
                        </Descriptions.Item>
                        <Descriptions.Item label="Alamat">{dataUserQuery.data?.alamat}</Descriptions.Item>
                        <Descriptions.Item label="Wali / Orang tua">{dataUserQuery.data?.wali}</Descriptions.Item>
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
            <Card>
                <Tabs items={items} />
            </Card>
        </div>
    );
}

export default TeacherDaftarSiswaDetail;
