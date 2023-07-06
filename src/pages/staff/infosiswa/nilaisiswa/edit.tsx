/* eslint-disable react/no-array-index-key */
import { Alert, Button, Card, Descriptions, Skeleton, Space } from "antd";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import EditTableNilai from "modules/nilaisiswa/edit-table-nilai";
import { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import Utils from "utils";
import { CLASSES_SEMESTER } from "utils/constant";

const getDataUser = httpsCallable(functionInstance, "getUserWithId");
const getCountSemesterGrade = httpsCallable(functionInstance, "getCountSemesterGrade");

function InfoSiswaNilaiEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [semester, setSemester] = useState(1);

    const dataUserQuery = useQuery(["detail-student", id], async () => {
        return (await getDataUser({ id })).data as Siswa;
    });

    const getCountSemesterGradeMutate = useQuery(
        ["get-count-semester-grade", id],
        async () => {
            return (await getCountSemesterGrade({ student_id: id })).data;
        },
        {
            refetchInterval: false,
            onSuccess(data: any) {
                setSemester(data?.semester || 1);
            },
        }
    );

    const onClickNewSemester = () => {
        if (semester === 6) return;
        setSemester((prev) => prev + 1);
    };

    const clickGoBack = (e: any) => {
        e.preventDefault();
        navigate(-1);
    };

    const maxCurrSemester = dataUserQuery.data?.kelas
        ? CLASSES_SEMESTER.filter((el) => Utils.SplitStrKelas(dataUserQuery.data?.kelas) === el).length
        : semester;

    if (!id) return <Alert type="error" message="Data tidak ditemukan" />;

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to=".." onClick={clickGoBack}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Edit Nilai Siwa</h1>
                </Space>
                <Button onClick={onClickNewSemester} disabled={semester === 6 || semester >= maxCurrSemester}>
                    Semester Baru
                </Button>
            </div>
            <StateRender
                data={dataUserQuery.data}
                isLoading={dataUserQuery.isLoading || getCountSemesterGradeMutate.isLoading}
                isError={dataUserQuery.isError}
            >
                <StateRender.Data>
                    <Card>
                        <Descriptions title="Detail Siswa">
                            <Descriptions.Item label="Nama">{dataUserQuery?.data?.nama}</Descriptions.Item>
                            <Descriptions.Item label="NIS">{dataUserQuery.data?.nis}</Descriptions.Item>
                            <Descriptions.Item label="NISN">{dataUserQuery.data?.nisn}</Descriptions.Item>
                            <Descriptions.Item label="Kelas">{dataUserQuery.data?.kelas}</Descriptions.Item>
                            <Descriptions.Item label="Alamat">{dataUserQuery.data?.alamat}</Descriptions.Item>
                            <Descriptions.Item label="Handphone">{dataUserQuery.data?.hp}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                    {[...new Array(semester)]?.map((_, i) => (
                        <EditTableNilai fetcher={dataUserQuery} semester={i + 1} key={i} />
                    ))}
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton active />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(dataUserQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default InfoSiswaNilaiEdit;
