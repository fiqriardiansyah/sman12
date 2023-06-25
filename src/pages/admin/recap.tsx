import { Alert, Card, Skeleton, Statistic } from "antd";
import StateRender from "components/common/state";
import dayjs from "dayjs";

import { httpsCallable } from "firebase/functions";
import { Guru } from "modules/dataguru/table";
import { Kelas } from "modules/datakelas/table";
import { Siswa } from "modules/datasiswa/table";
import { Staff } from "modules/datastaff/table";
import { BsPersonWorkspace } from "react-icons/bs";
import { FaChalkboardTeacher, FaFileDownload } from "react-icons/fa";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";

import Utils from "utils";
import { GENDER, JENJANG, KEPEGAWAIAN, STAFF_PATH } from "utils/constant";

const getStudents = httpsCallable(functionInstance, "getStudents");
const getAlumni = httpsCallable(functionInstance, "getAlumni");
const getClasses = httpsCallable(functionInstance, "getClasses");
const getAllAcademicYear = httpsCallable(functionInstance, "getAllAcademicYear");
const getTeachers = httpsCallable(functionInstance, "getTeachers");
const getStaffs = httpsCallable(functionInstance, "getStaffs");

function Rekap() {
    const teacherQuery = useQuery(["get-teacher"], async () => {
        return (await getTeachers()).data as Guru[];
    });

    const studentQuery = useQuery(["get-student"], async () => {
        return (await getStudents()).data as Siswa[];
    });

    const alumniQuery = useQuery(["get-alumni"], async () => {
        return (await getAlumni()).data as Siswa[];
    });

    const classQuery = useQuery(["get-classes"], async () => {
        return (await getClasses()).data as Kelas[];
    });

    const staffQuery = useQuery(["get-staffs"], async () => {
        return (await getStaffs()).data as Staff[];
    });

    const getAllAcademicYearQuery = useQuery(["get-all-academic-year"], async () => {
        return (await getAllAcademicYear()).data as string[] | null;
    });

    const getStudentsX = studentQuery.data?.filter((st) => (st?.kelas ? Utils.SplitStrKelas(st?.kelas) === "X" : false));
    const getStudentsXI = studentQuery.data?.filter((st) => (st?.kelas ? Utils.SplitStrKelas(st?.kelas) === "XI" : false));
    const getStudentsXII = studentQuery.data?.filter((st) => (st?.kelas ? Utils.SplitStrKelas(st?.kelas) === "XII" : false));
    const getAlumnis = alumniQuery.data;
    const getStudentsNoClass = studentQuery.data?.filter((st) => !st?.kelas);

    const getClassX = classQuery.data?.filter((cls) => cls?.kelas === "X");
    const getClassXI = classQuery.data?.filter((cls) => cls?.kelas === "XI");
    const getClassXII = classQuery.data?.filter((cls) => cls?.kelas === "XII");

    const getPns = teacherQuery.data?.filter((cls) => cls?.status_kepegawaian === 1);
    const getHonorer = teacherQuery.data?.filter((cls) => cls?.status_kepegawaian === 2);
    const getMaleTeacher = teacherQuery.data?.filter((cls) => cls?.kelamin === "L");
    const getFemaleTeacher = teacherQuery.data?.filter((cls) => cls?.kelamin === "P");

    const spanAlumniYear = () => {
        if (!getAllAcademicYearQuery.data) return "Belum ada alumni";
        if (getAllAcademicYearQuery.data?.length === 1) return `Dari ${getAllAcademicYearQuery.data[0]}`;
        return `Dari ${getAllAcademicYearQuery.data[0]} Sampai ${getAllAcademicYearQuery.data[getAllAcademicYearQuery.data.length - 1]}`;
    };

    const downloadStudentsX = () => {
        if (!getStudentsX?.length) return;
        Utils.ExportToExcel(
            `Daftar siswa kelas X ${new Date().getFullYear()}`,
            getStudentsX?.map((st) => ({
                Nama: st?.nama,
                Nis: st?.nis,
                Nisn: st?.nisn,
                "jenis kelamin": GENDER?.find((el) => el.value === st?.kelamin)?.label || "",
                Alamat: st?.alamat,
                Hp: st?.hp,
                "Orang tua": st?.wali,
                Stambuk: st?.stambuk,
            }))
        );
    };

    const downloadStudentsXI = () => {
        if (!getStudentsXI?.length) return;
        Utils.ExportToExcel(
            `Daftar siswa kelas XI ${new Date().getFullYear()}`,
            getStudentsXI?.map((st) => ({
                Nama: st?.nama,
                Nis: st?.nis,
                Nisn: st?.nisn,
                "jenis kelamin": GENDER?.find((el) => el.value === st?.kelamin)?.label || "",
                Alamat: st?.alamat,
                Hp: st?.hp,
                "Orang tua": st?.wali,
                Stambuk: st?.stambuk,
            }))
        );
    };

    const downloadStudentsXII = () => {
        if (!getStudentsXII?.length) return;
        Utils.ExportToExcel(
            `Daftar siswa kelas XII ${new Date().getFullYear()}`,
            getStudentsXII?.map((st) => ({
                Nama: st?.nama,
                Nis: st?.nis,
                Nisn: st?.nisn,
                "jenis kelamin": GENDER?.find((el) => el.value === st?.kelamin)?.label || "",
                Alamat: st?.alamat,
                Hp: st?.hp,
                "Orang tua": st?.wali,
                Stambuk: st?.stambuk,
            }))
        );
    };

    const downloadAlumni = () => {
        if (!getAlumnis?.length) return;
        Utils.ExportToExcel(
            "Daftar alumni",
            getAlumnis?.map((st) => ({
                Nama: st?.nama,
                Nis: st?.nis,
                Nisn: st?.nisn,
                "jenis kelamin": GENDER?.find((el) => el.value === st?.kelamin)?.label || "",
                Alamat: st?.alamat,
                Hp: st?.hp,
                "Orang tua": st?.wali,
                Stambuk: st?.stambuk,
                Lulus: st?.lulus,
            }))
        );
    };

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

    const downloadStaff = () => {
        if (!teacherQuery.data?.length) return;
        Utils.ExportToExcel(
            "Daftar Staff",
            staffQuery.data?.map((st) => ({
                Nama: st?.nama,
                NUPTK: st?.nuptk,
                "Jenis kelamin": GENDER?.find((el) => el.value === st?.kelamin)?.label || "",
                Alamat: st?.alamat,
                Hp: st?.hp,
                Posisi: st?.posisi,
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
                <h1 className="m-0">Rekap</h1>
            </div>
            <StateRender data={studentQuery.data} isLoading={studentQuery.isLoading} isError={studentQuery.isError}>
                <StateRender.Data>
                    <section className="flex flex-col gap-4">
                        <span>Rekap data siswa</span>
                        <div className="w-full grid grid-cols-4 gap-5">
                            <div className="rounded bg-red-300 p-3 flex flex-col items-center relative">
                                <FaFileDownload
                                    onClick={downloadStudentsX}
                                    className="!text-white absolute top-1 right-1 text-xl cursor-pointer hover:opacity-50"
                                    color="#ffffff"
                                />
                                <span className="text-white font-semibold">Total Siswa Kelas X</span>
                                <p className="text-white text-6xl font-bold m-0">{getStudentsX?.length}</p>
                                <div className="w-full flex items-center my-2 gap-x-4" style={{ borderTop: "1px solid white" }}>
                                    {getClassX?.map((cls) => (
                                        <Link to={`${STAFF_PATH.masterdata.datakelas.edit}/${cls.id}`}>
                                            <span className="text-white font-medium">{cls.nama_kelas}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded bg-yellow-300 p-3 flex flex-col items-center relative">
                                <FaFileDownload
                                    onClick={downloadStudentsXI}
                                    className="!text-white absolute top-1 right-1 text-xl cursor-pointer hover:opacity-50"
                                    color="#ffffff"
                                />
                                <span className="text-white font-semibold">Total Siswa Kelas XI</span>
                                <p className="text-white text-6xl font-bold m-0">{getStudentsXI?.length}</p>
                                <div className="w-full flex items-center justify-between my-2" style={{ borderTop: "1px solid white" }}>
                                    {getClassXI?.map((cls) => (
                                        <Link to={`${STAFF_PATH.masterdata.datakelas.edit}/${cls.id}`}>
                                            <span className="text-white font-medium">{cls.nama_kelas}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded bg-green-300 p-3 flex flex-col items-center relative">
                                <FaFileDownload
                                    onClick={downloadStudentsXII}
                                    className="!text-white absolute top-1 right-1 text-xl cursor-pointer hover:opacity-50"
                                    color="#ffffff"
                                />
                                <span className="text-white font-semibold">Total Siswa Kelas XII</span>
                                <p className="text-white text-6xl font-bold m-0">{getStudentsXII?.length}</p>
                                <div className="w-full flex items-center justify-between my-2" style={{ borderTop: "1px solid white" }}>
                                    {getClassXII?.map((cls) => (
                                        <Link to={`${STAFF_PATH.masterdata.datakelas.edit}/${cls.id}`}>
                                            <span className="text-white font-medium">{cls.nama_kelas}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded bg-gray-500 p-3 flex flex-col items-center relative">
                                <FaFileDownload
                                    onClick={downloadAlumni}
                                    className="!text-white absolute top-1 right-1 text-xl cursor-pointer hover:opacity-50"
                                    color="#ffffff"
                                />
                                <span className="text-white font-semibold">Total Alumni</span>
                                <p className="text-white text-6xl font-bold m-0">{getAlumnis?.length}</p>
                                <div className="w-full flex items-center justify-between my-2" style={{ borderTop: "1px solid white" }}>
                                    <span className="text-white font-medium">{spanAlumniYear()}</span>
                                </div>
                            </div>
                        </div>
                        {getStudentsNoClass?.length ? (
                            <Alert type="error" className="w-full" message={`${getStudentsNoClass?.length} siswa belum memiliki kelas`} />
                        ) : null}
                    </section>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton active />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(studentQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
            <StateRender data={teacherQuery.data} isLoading={teacherQuery.isLoading} isError={teacherQuery.isError}>
                <StateRender.Data>
                    <section className="flex flex-col gap-4">
                        <span>Rekap data guru</span>
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
                                    <Statistic
                                        title="Laki-Laki"
                                        value={getMaleTeacher?.length || 0}
                                        valueStyle={{ color: "#3f8600" }}
                                        suffix="Orang"
                                    />
                                    <Statistic
                                        title="Perempuan"
                                        value={getFemaleTeacher?.length || 0}
                                        valueStyle={{ color: "#3f8600" }}
                                        suffix="Orang"
                                    />
                                </div>
                            </Card>
                        </div>
                    </section>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton active />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(teacherQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
            <StateRender data={staffQuery.data} isLoading={staffQuery.isLoading} isError={staffQuery.isError}>
                <StateRender.Data>
                    <section className="flex flex-col gap-4">
                        <span>Rekap data staff</span>
                        <div className="w-full grid grid-cols-3 gap-x-5">
                            <Card bordered={false} className="!relative">
                                <FaFileDownload
                                    onClick={downloadStaff}
                                    className="!text-gray-500 absolute top-1 right-1 text-xl cursor-pointer hover:opacity-50"
                                />
                                <Statistic
                                    title="Total Seluruh Staff"
                                    value={staffQuery.data?.length || 0}
                                    prefix={<BsPersonWorkspace className="text-2xl mr-4" />}
                                    suffix="Orang"
                                />
                            </Card>
                        </div>
                    </section>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton active />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(staffQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default Rekap;
