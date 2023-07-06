import { Alert, Card, Skeleton, Statistic } from "antd";
import StateRender from "components/common/state";
import dayjs from "dayjs";

import { httpsCallable } from "firebase/functions";
import { Guru } from "modules/dataguru/table";
import { FaChalkboardTeacher, FaFileDownload } from "react-icons/fa";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";

import Utils from "utils";
import { GENDER, JENJANG, KEPEGAWAIAN } from "utils/constant";

const getTeachers = httpsCallable(functionInstance, "getTeachers");

function RecapGuru() {
    const teacherQuery = useQuery(["get-teacher"], async () => {
        return (await getTeachers()).data as Guru[];
    });

    const getPns = teacherQuery.data?.filter((cls) => cls?.status_kepegawaian === 1);
    const getHonorer = teacherQuery.data?.filter((cls) => cls?.status_kepegawaian === 2);
    const getMaleTeacher = teacherQuery.data?.filter((cls) => cls?.kelamin === "L");
    const getFemaleTeacher = teacherQuery.data?.filter((cls) => cls?.kelamin === "P");

    const downloadTeacher = () => {
        if (!teacherQuery.data?.length) return;
        Utils.ExportToExcel(
            "Daftar Guru",
            teacherQuery.data?.map((st) => ({
                Nama: st?.nama,
                NUPTK: st?.nuptk,
                NIP: st?.nip,
                "Jenis kelamin": GENDER?.find((el) => el.value === st?.kelamin)?.label || "",
                Alamat: st?.alamat,
                Hp: st?.hp,
                "Status Kepegawaian": KEPEGAWAIAN.find((el) => el.value === st?.status_kepegawaian)?.label,
                Jenjang: JENJANG.find((el) => el.value === st?.jenjang)?.label,
                Jurusan: st?.jurusan,
                "Tempat Lahir": st?.tempat_lahir,
                "Tanggal Lahir": st?.tgl_lahir ? dayjs(st?.tgl_lahir).format("DD/MM/YYYY") : "",
            }))
        );
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Rekapitulasi guru</h1>
            </div>
            <StateRender data={teacherQuery.data} isLoading={teacherQuery.isLoading} isError={teacherQuery.isError}>
                <StateRender.Data>
                    <div className="w-full grid grid-cols-3 gap-x-5">
                        <Card bordered={false} className="!relative">
                            <FaFileDownload
                                onClick={downloadTeacher}
                                className="!text-gray-500 absolute top-1 right-1 text-xl cursor-pointer hover:opacity-50"
                            />
                            <Statistic
                                title="Total Seluruh Guru"
                                value={teacherQuery.data?.length || 0}
                                valueStyle={{ color: "#3f8600" }}
                                prefix={<FaChalkboardTeacher className="text-2xl mr-4" />}
                                suffix="Guru"
                            />
                        </Card>
                        <Card bordered={false}>
                            <div className="flex items-center justify-between">
                                <Statistic title="PNS" value={getPns?.length || 0} valueStyle={{ color: "#3f8600" }} suffix="Orang" />
                                <Statistic title="Honorer" value={getHonorer?.length || 0} valueStyle={{ color: "#3f8600" }} suffix="Orang" />
                            </div>
                        </Card>
                        <Card bordered={false}>
                            <div className="flex items-center justify-between">
                                <Statistic title="Laki-Laki" value={getMaleTeacher?.length || 0} valueStyle={{ color: "#3f8600" }} suffix="Orang" />
                                <Statistic title="Perempuan" value={getFemaleTeacher?.length || 0} valueStyle={{ color: "#3f8600" }} suffix="Orang" />
                            </div>
                        </Card>
                    </div>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton active />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(teacherQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default RecapGuru;
