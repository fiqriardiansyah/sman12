import Layout from "components/common/layout";
import { UserContext } from "context/user";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ADMIN_PATH, STAFF_PATH, STUDENT_PATH, TEACHER_PATH } from "utils/constant";

// staff
import findAnim from "assets/animation/find.json";
import waitingAnim from "assets/animation/waiting.json";
import LaporanSPP from "pages/admin/laporan-spp";
import RecapGuru from "pages/admin/recap-guru";
import RecapSiswa from "pages/admin/recap-siswa";
import RecapStaf from "pages/admin/recap-staf";
import PergantianTahunAjar from "pages/admin/tahun-ajar";
import Login from "pages/auth/login";
import Alumni from "pages/staff/alumni";
import AlumniView from "pages/staff/alumni/view";
import InfoSiswaAbsensi from "pages/staff/infosiswa/absensisiswa";
import InfoSiswaAbsensiEdit from "pages/staff/infosiswa/absensisiswa/edit";
import InfoSiswaNilai from "pages/staff/infosiswa/nilaisiswa";
import InfoSiswaNilaiEdit from "pages/staff/infosiswa/nilaisiswa/edit";
import InfoSiswaSpp from "pages/staff/infosiswa/sppsiswa";
import InfoSiswaSppEdit from "pages/staff/infosiswa/sppsiswa/edit";
import MasterDataGuru from "pages/staff/masterdata/dataguru";
import MasterDataGuruAdd from "pages/staff/masterdata/dataguru/add";
import MasterDataGuruEdit from "pages/staff/masterdata/dataguru/edit";
import MasterDataKelas from "pages/staff/masterdata/datakelas";
import MasterDataKelasAdd from "pages/staff/masterdata/datakelas/add";
import MasterDataKelasEdit from "pages/staff/masterdata/datakelas/edit";
import MasterDataPelajaran from "pages/staff/masterdata/datapelajaran";
import MasterDataPelajaranAdd from "pages/staff/masterdata/datapelajaran/add";
import MasterDataPelajaranEdit from "pages/staff/masterdata/datapelajaran/edit";
import MasterDataSiswa from "pages/staff/masterdata/datasiswa";
import MasterDataSiswaAdd from "pages/staff/masterdata/datasiswa/add";
import MasterDataSiswaEdit from "pages/staff/masterdata/datasiswa/edit";
import MasterDataStaff from "pages/staff/masterdata/datastaff";
import MasterDataStaffAdd from "pages/staff/masterdata/datastaff/add";
import MasterDataStaffEdit from "pages/staff/masterdata/datastaff/edit";
import StaffPengumuman from "pages/staff/pengumuman";
import StaffPengumumanAdd from "pages/staff/pengumuman/add";
import StaffPengumumanEdit from "pages/staff/pengumuman/edit";
import Profile from "pages/staff/profile";
import ProfileEdit from "pages/staff/profile/edit";
import StudentAbsensi from "pages/student/absensi";
import StudentMataPelajaran from "pages/student/mata-pelajaran";
import StudentNilai from "pages/student/nilai";
import StudentPengumuman from "pages/student/pengumuman";
import StudentPengumumanDetail from "pages/student/pengumuman/detail";
import StudentProfile from "pages/student/profile";
import StudentProfileEdit from "pages/student/profile/edit";
import StudentSPP from "pages/student/spp";
import TeacherPengumuman from "pages/teacher/pengumuman";
import TeacherPengumumanDetail from "pages/teacher/pengumuman/detail";
import TeacherPerwalian from "pages/teacher/perwalian";
import TeacherProfile from "pages/teacher/profile";
import TeacherProfileEdit from "pages/teacher/profile/edit";
import TeacherDaftarSiswa from "pages/teacher/siswa";
import TeacherDaftarSiswaDetail from "pages/teacher/siswa/detail";
import Lottie from "react-lottie";
import ForgotPassword from "pages/auth/forgotpassword";

const waitingOptions = {
    loop: true,
    autoplay: true,
    animationData: waitingAnim,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

const findOptions = {
    loop: true,
    autoplay: true,
    animationData: findAnim,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

function App() {
    const { state } = React.useContext(UserContext);

    if (state?.loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Lottie options={waitingOptions} height={400} width={400} isClickToPauseDisabled={false} />
            </div>
        );
    }

    if (state?.loadingGetData) {
        return (
            <div className="w-full h-screen flex items-center justify-center flex-col">
                <Lottie options={findOptions} height={100} width={400} isClickToPauseDisabled={false} />
                <p className="text-xl">Mengambil data...</p>
            </div>
        );
    }

    return (
        <BrowserRouter>
            {!state?.user && !state?.loading && (
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/forgotpassword" element={<ForgotPassword />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            )}
            {state?.user && !state.loading && (
                <Layout>
                    {(state?.user?.role === "staff" || state?.user?.role === "admin") && (
                        <Routes>
                            {state?.user?.role === "admin" && (
                                <>
                                    <Route path={ADMIN_PATH.laporanspp.index} element={<LaporanSPP />} />
                                    <Route path={ADMIN_PATH.tahunajar.index} element={<PergantianTahunAjar />} />
                                    <Route path={ADMIN_PATH.rekap.siswa} element={<RecapSiswa />} />
                                    <Route path={ADMIN_PATH.rekap.guru} element={<RecapGuru />} />
                                    <Route path={ADMIN_PATH.rekap.staf} element={<RecapStaf />} />
                                </>
                            )}

                            <Route path={STAFF_PATH.profile.index} element={<Profile />} />
                            <Route path={STAFF_PATH.profile.edit} element={<ProfileEdit />} />

                            <Route path={STAFF_PATH.masterdata.datasiswa.index} element={<MasterDataSiswa />} />
                            <Route path={STAFF_PATH.masterdata.datasiswa.add} element={<MasterDataSiswaAdd />} />
                            <Route path={`${STAFF_PATH.masterdata.datasiswa.edit}/:id`} element={<MasterDataSiswaEdit />} />

                            <Route path={STAFF_PATH.masterdata.dataguru.index} element={<MasterDataGuru />} />
                            <Route path={STAFF_PATH.masterdata.dataguru.add} element={<MasterDataGuruAdd />} />
                            <Route path={`${STAFF_PATH.masterdata.dataguru.edit}/:id`} element={<MasterDataGuruEdit />} />

                            <Route path={STAFF_PATH.masterdata.datakelas.index} element={<MasterDataKelas />} />
                            <Route path={STAFF_PATH.masterdata.datakelas.add} element={<MasterDataKelasAdd />} />
                            <Route path={`${STAFF_PATH.masterdata.datakelas.edit}/:id`} element={<MasterDataKelasEdit />} />

                            <Route path={STAFF_PATH.masterdata.datastaff.index} element={<MasterDataStaff />} />
                            <Route path={STAFF_PATH.masterdata.datastaff.add} element={<MasterDataStaffAdd />} />
                            <Route path={`${STAFF_PATH.masterdata.datastaff.edit}/:id`} element={<MasterDataStaffEdit />} />

                            <Route path={STAFF_PATH.masterdata.datapelajaran.index} element={<MasterDataPelajaran />} />
                            <Route path={STAFF_PATH.masterdata.datapelajaran.add} element={<MasterDataPelajaranAdd />} />
                            <Route path={`${STAFF_PATH.masterdata.datapelajaran.edit}/:id`} element={<MasterDataPelajaranEdit />} />

                            <Route path={STAFF_PATH.infosiswa.nilaisiswa.index} element={<InfoSiswaNilai />} />
                            <Route path={`${STAFF_PATH.infosiswa.nilaisiswa.edit}/:id`} element={<InfoSiswaNilaiEdit />} />

                            <Route path={STAFF_PATH.infosiswa.absensisiswa.index} element={<InfoSiswaAbsensi />} />
                            <Route path={`${STAFF_PATH.infosiswa.absensisiswa.edit}/:id`} element={<InfoSiswaAbsensiEdit />} />

                            <Route path={STAFF_PATH.infosiswa.sppsiswa.index} element={<InfoSiswaSpp />} />
                            <Route path={`${STAFF_PATH.infosiswa.sppsiswa.edit}/:id`} element={<InfoSiswaSppEdit />} />

                            <Route path={STAFF_PATH.pengumuman.index} element={<StaffPengumuman />} />
                            <Route path={STAFF_PATH.pengumuman.add} element={<StaffPengumumanAdd />} />
                            <Route path={`${STAFF_PATH.pengumuman.edit}/:id`} element={<StaffPengumumanEdit />} />

                            <Route path={STAFF_PATH.alumni.index} element={<Alumni />} />
                            <Route path={`${STAFF_PATH.alumni.index}/:id`} element={<AlumniView />} />

                            <Route path="*" element={<Navigate to={STAFF_PATH.profile.index} />} />
                        </Routes>
                    )}
                    {state?.user?.role === "student" && (
                        <Routes>
                            <Route path={STUDENT_PATH.profile.index} element={<StudentProfile />} />
                            <Route path={STUDENT_PATH.profile.edit} element={<StudentProfileEdit />} />
                            <Route path={STUDENT_PATH.nilai.index} element={<StudentNilai />} />
                            <Route path={STUDENT_PATH.mata_pelajaran.index} element={<StudentMataPelajaran />} />
                            <Route path={STUDENT_PATH.absensi.index} element={<StudentAbsensi />} />
                            <Route path={STUDENT_PATH.pengumuman.index} element={<StudentPengumuman />} />
                            <Route path={`${STUDENT_PATH.pengumuman.index}/:id`} element={<StudentPengumumanDetail />} />
                            <Route path={STUDENT_PATH.spp.index} element={<StudentSPP />} />
                            <Route path="*" element={<Navigate to={STUDENT_PATH.pengumuman.index} />} />
                        </Routes>
                    )}
                    {state?.user?.role === "teacher" && (
                        <Routes>
                            <Route path={TEACHER_PATH.profile.index} element={<TeacherProfile />} />
                            <Route path={TEACHER_PATH.profile.edit} element={<TeacherProfileEdit />} />
                            <Route path={TEACHER_PATH.siswa.index} element={<TeacherDaftarSiswa />} />
                            <Route path={`${TEACHER_PATH.siswa.index}/:id`} element={<TeacherDaftarSiswaDetail />} />
                            <Route path={TEACHER_PATH.pengumuman.index} element={<TeacherPengumuman />} />
                            <Route path={`${TEACHER_PATH.pengumuman.index}/:id`} element={<TeacherPengumumanDetail />} />
                            <Route path={TEACHER_PATH.perwalian.index} element={<TeacherPerwalian />} />
                            <Route path="*" element={<Navigate to={TEACHER_PATH.pengumuman.index} />} />
                        </Routes>
                    )}
                </Layout>
            )}
        </BrowserRouter>
    );
}

export default App;
