import { Alert, Card, Skeleton, Tabs, TabsProps } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import gradeAnimation from "assets/animation/grades.json";
import { Chart as ChartJS, registerables } from "chart.js";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import MonthHistory from "modules/absensi[siswa]/mont-history";
import { Staff } from "modules/datastaff/table";
import { Nilai } from "modules/nilaisiswa/table-nilai";
import { Pelajaran } from "pages/staff/masterdata/datapelajaran/add";
import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import Lottie from "react-lottie";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import Utils from "utils";
import { CLASSES, CLASSES_SEMESTER } from "utils/constant";

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

function Akademik({ kelas }: { kelas: any }) {
    const { id } = useParams();

    const [tabClass, setTabClass] = useState<string>(kelas === "LULUS" ? Utils.SplitStrKelas(kelas) : "XII");

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
        ["get-my-grades", id],
        async () => {
            const result = (await getMyGrades({ student_id: id })).data as any;
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
            enabled: !!id,
        }
    );

    const dataChart = {
        labels: [...new Array(6)].map((_, i) => `Semester ${i + 1}`),
        datasets: [
            {
                label: "Rata-Rata nilai semester",
                data: getMyGradesQuery.data?.map((grade) => ({
                    x: `Semester ${grade.semester}`,
                    y: (grade?.grades?.reduce((a, b) => a + b.nilai, 0) || 0) / (grade?.grades?.length || 1),
                })),
                fill: true,
                lineTension: 0.5,
                pointStyle: "circle",
                pointRadius: 10,
                pointHoverRadius: 15,
            },
        ],
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

    const onChange = (key: string) => {
        setTabClass(key);
    };

    const itemsAbsen: TabsProps["items"] = CLASSES?.map((cls) => ({
        key: cls,
        label: `Kelas ${cls}`,
        children: <MonthHistory cls={cls} studentId={id} />,
    }));

    const items: TabsProps["items"] = getMyGradesQuery.data?.map((grade) => ({
        key: grade.semester,
        label: `KELAS ${CLASSES_SEMESTER[Number(grade.semester) - 1]} - SEMESTER ${Number(grade.semester) % 2 !== 0 ? 1 : 2}`,
        children: (
            <Table
                rowKey={(i) => i.mata_pelajaran}
                columns={columns as any}
                dataSource={grade.grades}
                pagination={{ position: ["none" as any], pageSize: 100 }}
                summary={() => (
                    <Table.Summary>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}>
                                <span className="font-semibold">Rata-Rata</span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                                <span className="font-semibold">
                                    {(grade?.grades?.reduce((a, b) => a + b.nilai, 0) || 0) / (grade?.grades?.length || 1)}
                                </span>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />
        ),
    }));

    return (
        <div className="w-full pb-20">
            <h1 className="m-0 mb-10 pt-4">Nilai akhir siswa</h1>
            <StateRender data={getMyGradesQuery.data} isLoading={getMyGradesQuery.isLoading} isError={getMyGradesQuery.isError}>
                <StateRender.Data>
                    <Card>
                        <Line
                            data={dataChart as any}
                            options={{
                                responsive: true,
                                scales: {
                                    y: {
                                        min: 0,
                                        max: 100,
                                    },
                                },
                            }}
                        />
                    </Card>
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
            <h1 className="m-0 mb-6 pt-10">Absensi siswa</h1>
            <Tabs activeKey={tabClass} items={itemsAbsen} onChange={onChange} />
        </div>
    );
}

export default Akademik;
