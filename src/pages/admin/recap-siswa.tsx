import { Alert, Skeleton } from "antd";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import { Kelas } from "modules/datakelas/table";
import { Siswa } from "modules/datasiswa/table";
import { FaFileDownload } from "react-icons/fa";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import Utils from "utils";
import { GENDER, STAFF_PATH } from "utils/constant";

const getStudents = httpsCallable(functionInstance, "getStudents");
const getAlumni = httpsCallable(functionInstance, "getAlumni");
const getClasses = httpsCallable(functionInstance, "getClasses");
const getAllAcademicYear = httpsCallable(functionInstance, "getAllAcademicYear");

function RecapSiswa() {
    const studentQuery = useQuery(["get-student"], async () => {
        return (await getStudents()).data as Siswa[];
    });

    const alumniQuery = useQuery(["get-alumni"], async () => {
        return (await getAlumni()).data as Siswa[];
    });

    const classQuery = useQuery(["get-classes"], async () => {
        return (await getClasses()).data as Kelas[];
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
                NIS: st?.nis,
                NISN: st?.nisn,
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
                NIS: st?.nis,
                NISN: st?.nisn,
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
                NIS: st?.nis,
                NISN: st?.nisn,
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
                NIS: st?.nis,
                NISN: st?.nisn,
                "jenis kelamin": GENDER?.find((el) => el.value === st?.kelamin)?.label || "",
                Alamat: st?.alamat,
                Hp: st?.hp,
                "Orang tua": st?.wali,
                Stambuk: st?.stambuk,
                Lulus: st?.lulus,
            }))
        );
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Rekapitulasi siswa</h1>
            </div>
            <StateRender data={studentQuery.data} isLoading={studentQuery.isLoading} isError={studentQuery.isError}>
                <StateRender.Data>
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
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton active />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(studentQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default RecapSiswa;
