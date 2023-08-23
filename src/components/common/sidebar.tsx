import { Menu, MenuProps, Tag } from "antd";
import { Note } from "components/card-note";
import configFirebase from "config/firebase";
import { UserContext } from "context/user";
import { getAuth } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { useContext } from "react";
import { BiMoney } from "react-icons/bi";
import { BsClipboard2DataFill } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { FiAward, FiLogOut } from "react-icons/fi";
import { GrAnnounce } from "react-icons/gr";
import { IoIosSchool } from "react-icons/io";
import { MdGrading, MdOutlineSpaceDashboard, MdOutlineSubject, MdOutlineSupervisedUserCircle, MdSchool } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import { TbSchoolOff } from "react-icons/tb";
import { useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { ADMIN_PATH, STAFF_PATH, STUDENT_PATH, TEACHER_PATH } from "utils/constant";
import logoSman12 from "assets/images/logosman12.png";
import { SppTable } from "modules/sppsiswa/spp-month-table";

type MenuItem = Required<MenuProps>["items"][number];

const getNoteByStudent = httpsCallable(functionInstance, "getNoteByStudent");
const getNotesByTeacher = httpsCallable(functionInstance, "getNotesByTeacher");
const getNotLegalizeSpp = httpsCallable(functionInstance, "getNotLegalizeSpp");

function Sidebar() {
    const { state } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    const getNotLegalizeSppQuery = useQuery(
        ["getNotLegalizeSpp"],
        async () => {
            return (await getNotLegalizeSpp()).data as SppTable[];
        },
        {
            enabled: state?.user?.role === "admin",
        }
    );

    const getNoteByStudentQuery = useQuery(
        ["get-note-student", state?.user?.id],
        async () => {
            return (await getNoteByStudent({ student_id: state?.user?.id })).data as Note[];
        },
        {
            enabled: state?.user?.role === "student",
        }
    );

    const getNotesByTeacherQuery = useQuery(
        ["get-note-class"],
        async () => {
            return (await getNotesByTeacher({ kelas_id: state?.user?.kelas_id })).data as Note[];
        },
        {
            enabled: Boolean(state?.user?.role === "teacher" && state?.user?.kelas_id),
        }
    );

    const totalUnseenNoteStudent = getNoteByStudentQuery.data?.filter((el) => !el?.receiver_seen).length || 0;
    const totalUnseenNoteTeacher = getNotesByTeacherQuery.data?.filter((el) => !el?.teacher_seen).length || 0;
    const totalNotLegalizedSpp = getNotLegalizeSppQuery.data?.length || 0;

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
        { label: "Profil", key: TEACHER_PATH.profile.index, icon: <CgProfile /> },
        { label: "Daftar Siswa", key: TEACHER_PATH.siswa.index, icon: <MdOutlineSupervisedUserCircle /> },
        { label: "Pengumuman", key: TEACHER_PATH.pengumuman.index, icon: <GrAnnounce /> },
        {
            label: (
                <div className="flex justify-between items-center">
                    Wali Kelas{" "}
                    {totalUnseenNoteTeacher ? (
                        <Tag className="h-fit" color="red" title={`${totalUnseenNoteTeacher} Catatan Baru`}>
                            {totalUnseenNoteTeacher}
                        </Tag>
                    ) : null}
                </div>
            ),
            key: TEACHER_PATH.perwalian.index,
            icon: <SiGoogleclassroom />,
        },
    ];

    const staffMenuItems: MenuItem[] = [
        { label: "Profil", key: STAFF_PATH.profile.index, icon: <CgProfile /> },
        {
            label: "Master Data",
            key: "masterdata",
            icon: <MdOutlineSpaceDashboard />,
            children: [
                { label: "Data Siswa", key: STAFF_PATH.masterdata.datasiswa.index },
                { label: "Data Guru", key: STAFF_PATH.masterdata.dataguru.index },
                { label: "Data Kelas", key: STAFF_PATH.masterdata.datakelas.index },
                { label: "Data Pelajaran", key: STAFF_PATH.masterdata.datapelajaran.index },
            ],
        },
        {
            label: "Kelola Siswa",
            key: "infosiswa",
            icon: <MdOutlineSupervisedUserCircle />,
            children: [
                { label: "Nilai Siswa", key: STAFF_PATH.infosiswa.nilaisiswa.index },
                { label: "Absensi Siswa", key: STAFF_PATH.infosiswa.absensisiswa.index },
                { label: "SPP Siswa", key: STAFF_PATH.infosiswa.sppsiswa.index },
            ],
        },
        { label: "Pengumuman", key: STAFF_PATH.pengumuman.index, icon: <GrAnnounce /> },
        { label: "Alumni", key: STAFF_PATH.alumni.index, icon: <TbSchoolOff /> },
    ];

    const studentMenuItems: MenuItem[] = [
        {
            label: (
                <div className="flex justify-between items-center">
                    Profil
                    {totalUnseenNoteStudent ? (
                        <Tag className="h-fit" color="red" title={`${totalUnseenNoteStudent} Catatan Baru`}>
                            {totalUnseenNoteStudent}
                        </Tag>
                    ) : null}
                </div>
            ),
            key: STUDENT_PATH.profile.index,
            icon: <CgProfile />,
        },
        { label: "Nilai", key: STUDENT_PATH.nilai.index, icon: <MdGrading /> },
        { label: "Mata Pelajaran", key: STUDENT_PATH.mata_pelajaran.index, icon: <MdOutlineSubject /> },
        { label: "SPP", key: STUDENT_PATH.spp.index, icon: <IoIosSchool /> },
        { label: "Absensi", key: STUDENT_PATH.absensi.index, icon: <FiAward /> },
        { label: "Pengumuman", key: STUDENT_PATH.pengumuman.index, icon: <GrAnnounce /> },
    ];

    const adminMenuItems: MenuItem[] = [
        {
            label: (
                <div className="flex justify-between items-center">
                    Laporan SPP
                    {totalNotLegalizedSpp ? (
                        <Tag className="h-fit" color="red" title={`${totalNotLegalizedSpp} Pembayaran Baru`}>
                            {totalNotLegalizedSpp}
                        </Tag>
                    ) : null}
                </div>
            ),
            key: ADMIN_PATH.laporanspp.index,
            icon: <BiMoney />,
        },
        {
            label: "Rekapitulasi",
            key: ADMIN_PATH.rekap.index,
            icon: <BsClipboard2DataFill />,
            children: [
                { label: "Siswa", key: ADMIN_PATH.rekap.siswa },
                { label: "Guru", key: ADMIN_PATH.rekap.guru },
                { label: "Staf", key: ADMIN_PATH.rekap.staf },
            ],
        },
        {
            label: "Kenaikan kelas",
            key: ADMIN_PATH.tahunajar.index,
            icon: <MdSchool />,
        },
        ...(staffMenuItems as any).map((menu: any) =>
            menu?.key === "masterdata"
                ? { ...menu, children: [...menu.children, { label: "Data Staf", key: STAFF_PATH.masterdata.datastaff.index }] } // tambah master data staff
                : menu
        ),
    ];

    const configMenuItems: MenuItem[] = [{ label: "Logout", key: "logout", icon: <FiLogOut />, danger: true, onClick: onClickLogout }];

    const mapRoleMenu = {
        teacher: [...teacherMenuItems, ...configMenuItems],
        staff: [...staffMenuItems, ...configMenuItems],
        student: [...studentMenuItems, ...configMenuItems],
        admin: [...adminMenuItems, ...configMenuItems],
    };

    return (
        <div className="h-screen overflow-y-auto pb-20 flex flex-col items-center">
            <img src={logoSman12} alt="SMAN 12" className="w-[100px] mx-auto my-5" />
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
