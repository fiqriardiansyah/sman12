import { Alert, Descriptions, Image, Skeleton, Space } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";

import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import { IoMdArrowBack } from "react-icons/io";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { GENDER, IMAGE_FALLBACK, TEACHER_PATH } from "utils/constant";

function TeacherDaftarSiswaDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const getDataUser = httpsCallable(functionInstance, "getUserWithId");

    const dataUserQuery = useQuery(["detail-student", id], async () => {
        return (await getDataUser({ id })).data as Siswa;
    });

    const clickGoBack = (e: any) => {
        e.preventDefault();
        navigate(-1);
    };

    if (!id) return <Alert type="error" message="Halaman tidak ditemukan" />;

    return (
        <div className="flex flex-col gap-5">
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
                        <Descriptions.Item label="Kelamin">{GENDER.find((el) => el.value === dataUserQuery?.data?.kelamin)?.label}</Descriptions.Item>
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
        </div>
    );
}

export default TeacherDaftarSiswaDetail;
