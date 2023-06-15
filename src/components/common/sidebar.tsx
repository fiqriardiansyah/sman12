import { Menu, MenuProps } from "antd";
import configFirebase from "config/firebase";
import { UserContext } from "context/user";
import { getAuth } from "firebase/auth";
import React, { useContext } from "react";
import { CgProfile } from "react-icons/cg";
import { FiAward, FiLogOut } from "react-icons/fi";
import { GrAnnounce } from "react-icons/gr";
import { IoIosSchool } from "react-icons/io";
import { MdGrading, MdOutlineSpaceDashboard, MdOutlineSubject, MdOutlineSupervisedUserCircle } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import { useLocation, useNavigate } from "react-router-dom";
import { STAFF_PATH, STUDENT_PATH, TEACHER_PATH } from "utils/constant";

type MenuItem = Required<MenuProps>["items"][number];

function Sidebar() {
    const { state } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    const onClick: MenuProps["onClick"] = (e) => {
        navigate(e.key);
    };

    const onClickLogout = () => {
        getAuth(configFirebase.app)
            .signOut()
            .then(() => {
                window.location.reload();
            });
    };

    const teacherMenuItems: MenuItem[] = [
        { label: "Profile", key: TEACHER_PATH.profile.index, icon: <CgProfile /> },
        { label: "Daftar Siswa", key: TEACHER_PATH.siswa.index, icon: <MdOutlineSupervisedUserCircle /> },
        { label: "Pengumuman", key: TEACHER_PATH.pengumuman.index, icon: <GrAnnounce /> },
        { label: "Perwalian Kelas", key: TEACHER_PATH.perwalian.index, icon: <SiGoogleclassroom /> },
    ];

    const staffMenuItems: MenuItem[] = [
        { label: "Profile", key: STAFF_PATH.profile.index, icon: <CgProfile /> },
        {
            label: "Master Data",
            key: "masterdata",
            icon: <MdOutlineSpaceDashboard />,
            children: [
                { label: "Data Siswa", key: STAFF_PATH.masterdata.datasiswa.index },
                { label: "Data Guru", key: STAFF_PATH.masterdata.dataguru.index },
                { label: "Data Staff", key: STAFF_PATH.masterdata.datastaff.index },
                { label: "Data Kelas", key: STAFF_PATH.masterdata.datakelas.index },
                { label: "Data Pelajaran", key: STAFF_PATH.masterdata.datapelajaran.index },
            ],
        },
        {
            label: "Info Siswa",
            key: "infosiswa",
            icon: <MdOutlineSupervisedUserCircle />,
            children: [
                { label: "Nilai Siswa", key: STAFF_PATH.infosiswa.nilaisiswa.index },
                { label: "Absensi Siswa", key: STAFF_PATH.infosiswa.absensisiswa.index },
                { label: "SPP Siswa", key: STAFF_PATH.infosiswa.sppsiswa.index },
            ],
        },
        { label: "Pengumuman", key: STAFF_PATH.pengumuman.index, icon: <GrAnnounce /> },
    ];

    const studentMenuItems: MenuItem[] = [
        { label: "Profile", key: STUDENT_PATH.profile.index, icon: <CgProfile /> },
        { label: "Nilai", key: STUDENT_PATH.nilai.index, icon: <MdGrading /> },
        { label: "Mata Pelajaran", key: STUDENT_PATH.mata_pelajaran.index, icon: <MdOutlineSubject /> },
        { label: "SPP", key: STUDENT_PATH.spp.index, icon: <IoIosSchool /> },
        { label: "Absensi", key: STUDENT_PATH.absensi.index, icon: <FiAward /> },
        { label: "Pengumuman", key: STUDENT_PATH.pengumuman.index, icon: <GrAnnounce /> },
    ];

    const configMenuItems: MenuItem[] = [{ label: "Logout", key: "logout", icon: <FiLogOut />, danger: true, onClick: onClickLogout }];

    const mapRoleMenu = {
        teacher: [...teacherMenuItems, ...configMenuItems],
        staff: [...staffMenuItems, ...configMenuItems],
        student: [...studentMenuItems, ...configMenuItems],
    };

    return (
        <div className="h-screen overflow-y-auto pb-20">
            <Menu
                onClick={onClick}
                mode="inline"
                items={state?.user?.role ? mapRoleMenu[state?.user?.role] : []}
                selectedKeys={[`/${location.pathname?.split("/")[1]}`]}
            />
        </div>
    );
}

export default Sidebar;
