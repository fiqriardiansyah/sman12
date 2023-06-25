import { Alert, Card, Skeleton, Tabs, TabsProps } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import gradeAnimation from "assets/animation/grades.json";
import { Chart as ChartJS, registerables } from "chart.js";
import StateRender from "components/common/state";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import { Staff } from "modules/datastaff/table";
import { Nilai } from "modules/nilaisiswa/table-nilai";
import { Pelajaran } from "pages/staff/masterdata/datapelajaran/add";
import { useContext } from "react";
import { Bar } from "react-chartjs-2";
import Lottie from "react-lottie";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { CLASSES_SEMESTER } from "utils/constant";

ChartJS.register(...registerables);

const getMyGrades = httpsCallable(functionInstance, "getMyGrades");
const getSubjects = httpsCallable(functionInstance, "getSubjects");
const getStaffs = httpsCallable(functionInstance, "getStaffs");

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: gradeAnimation,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

function StudentNilai() {
    const { state } = useContext(UserContext);

    const subjectsQuery = useQuery(["get-subject"], async () => {
        return ((await getSubjects()).data as Pelajaran[])?.map((el) => ({
            label: el.mata_pelajaran?.CapitalizeEachFirstLetter(),
            value: el.id,
        }));
    });

    const getStaffsQuery = useQuery(["get-staff"], async () => {
        return (await getStaffs()).data as Staff[];
    });

    const getMyGradesQuery = useQuery(
        ["get-my-grades", state?.user?.id],
        async () => {
            const result = (await getMyGrades({ student_id: state?.user?.id })).data as any;
            const listGradesPerSemester = Object.keys(result || {})?.map((key) => {
                const grades = result[key];
                return {
                    semester: key,
                    grades: Object.keys(grades).map((subject) => ({
                        mata_pelajaran: subject,
                        nilai: grades[subject].nilai,
                        catatan: grades[subject].catatan,
                        author_id: grades[subject]?.author_id,
                    })),
                };
            });

            return listGradesPerSemester || [];
        },
        {
            enabled: !!state?.user?.id,
        }
    );

    const getLabelsChart = () => {
        if (!getMyGradesQuery.data || !subjectsQuery.data) return [];
        const labels = getMyGradesQuery.data?.map((grade) =>
            grade.grades?.map((g) => subjectsQuery.data?.find((sub) => sub.value === g.mata_pelajaran)?.label)
        );
        const labelsSet = new Set(labels.flat(1));
        return Array.from(labelsSet) || [];
    };

    const dataChart = {
        labels: getLabelsChart(),
        datasets: getMyGradesQuery.data?.map((grade) => ({
            label: `Semester ${grade.semester}`,
            data: grade?.grades?.map((g) => ({
                x: subjectsQuery.data?.find((sub) => sub.value === g.mata_pelajaran)?.label,
                y: g.nilai,
            })),
            fill: true,
            lineTension: 0.5,
        })),
    };

    const options = {
        title: {
            display: true,
            text: "Bagan nilai siswa",
        },
        responsive: true,
    };

    const columns: ColumnsType<Nilai> = [
        {
            title: "Mata Pelajaran",
            dataIndex: "mata_pelajaran",
            render: (text) => <p className="m-0 capitalize">{text ? subjectsQuery.data?.find((el) => el.value === text)?.label : ""}</p>,
        },
        {
            title: "Nilai",
            dataIndex: "nilai",
            render: (text) => <p className="m-0 capitalize">{text}</p>,
        },
        {
            title: "Catatan",
            dataIndex: "catatan",
            render: (text) => <p className="m-0 capitalize">{text}</p>,
        },
        {
            title: "Dibuat oleh",
            dataIndex: "author_id",
            render: (text) => <p className="m-0">{text ? getStaffsQuery.data?.find((staff) => staff.id === text)?.nama : ""}</p>,
        },
    ];

    const items: TabsProps["items"] = getMyGradesQuery.data?.map((grade) => ({
        key: grade.semester,
        label: `KELAS ${CLASSES_SEMESTER[Number(grade.semester) - 1]} - SEMESTER ${Number(grade.semester) % 2 !== 0 ? 1 : 2}`,
        children: (
            <Table
                rowKey={(i) => i.mata_pelajaran}
                columns={columns as any}
                dataSource={grade.grades}
                pagination={{ position: ["none" as any], pageSize: 100 }}
            />
        ),
    }));

    return (
        <div className="w-full pb-20">
            <h1 className="m-0 mb-10 pt-4">Nilai akhir siswa</h1>
            <StateRender data={getMyGradesQuery.data} isLoading={getMyGradesQuery.isLoading} isError={getMyGradesQuery.isError}>
                <StateRender.Data>
                    {getLabelsChart().length ? (
                        <Card>
                            <Bar data={dataChart as any} options={options as any} />
                        </Card>
                    ) : null}
                    <div className="grid w-full grid-cols-1 gap-10 mt-10">
                        {getMyGradesQuery.data?.length ? (
                            <Tabs type="card" items={items} />
                        ) : (
                            <div className="col-span-2 flex flex-col items-center justify-center h-[400px]">
                                <Lottie options={defaultOptions} height={400} width={400} isClickToPauseDisabled={false} />
                                <p className="m-0 text-xl text-gray-500 -translate-y-20">Daftar nilai belum tersedia</p>
                            </div>
                        )}
                    </div>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(getMyGradesQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default StudentNilai;
