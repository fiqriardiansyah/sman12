import { Alert, Card, Skeleton, Tabs, TabsProps } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import gradeAnimation from "assets/animation/grades.json";
import { Chart as ChartJS, registerables } from "chart.js";
import StateRender from "components/common/state";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import { Staff } from "modules/datastaff/table";
import { Nilai } from "modules/nilaisiswa/table-nilai";
import { useContext } from "react";
import { Bar, Line } from "react-chartjs-2";
import Lottie from "react-lottie";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { CLASSES_SEMESTER } from "utils/constant";

ChartJS.register(...registerables);

const getMyGrades = httpsCallable(functionInstance, "getMyGrades");
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

    const dataChart = {
        labels: [...new Array(6)].map((_, i) => `Semester ${i + 1}`),
        datasets: [
            {
                label: "Rata-Rata nilai semester",
                data: getMyGradesQuery.data?.map((grade) => ({
                    x: `Semester ${grade.semester}`,
                    y: parseFloat(((grade?.grades?.reduce((a, b) => a + b.nilai, 0) || 0) / (grade?.grades?.length || 1)).toFixed(1)),
                })),
                fill: true,
                lineTension: 0.5,
                pointStyle: "circle",
                pointRadius: 10,
                pointHoverRadius: 15,
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                min: 0,
                max: 100,
            },
        },
    };

    const columns: ColumnsType<Nilai> = [
        {
            title: "Mata Pelajaran",
            dataIndex: "mata_pelajaran",
            render: (text) => <p className="m-0 capitalize">{text}</p>,
        },
        {
            title: "Nilai",
            dataIndex: "nilai",
            render: (text) => <p className="m-0 capitalize">{text}</p>,
        },
        {
            title: "Capaian Kompetensi",
            dataIndex: "catatan",
            render: (text) => <p className="m-0 capitalize">{text}</p>,
        },
        {
            title: "Dibuat oleh",
            dataIndex: "author_id",
            render: (text) => <p className="m-0">{text ? getStaffsQuery.data?.find((staff) => staff.id === text)?.nama : ""}</p>,
        },
    ];

    const columnsAverage: ColumnsType<any> = [
        {
            title: "Mata Pelajaran",
            dataIndex: "mata_pelajaran",
            render: (text) => <p className="m-0 capitalize">{text}</p>,
        },
        {
            title: "Grafik Nilai",
            dataIndex: "-",
            render: (text, record) => {
                const subject = (record?.mata_pelajaran as string)?.CapitalizeEachFirstLetter();
                const data = {
                    labels: [...new Array(6)].map((_, i) => `Semester ${i + 1}`),
                    datasets: [
                        {
                            label: subject,
                            data: record?.summary?.map((sum: any) => ({
                                x: `Semester ${sum?.semester}`,
                                y: sum?.nilai,
                            })),
                            fill: true,
                            lineTension: 0.5,
                        },
                    ],
                };
                return (
                    <div className="h-[200px]">
                        <Line data={data as any} options={options} />
                    </div>
                );
            },
        },
        {
            title: "Rata nilai",
            render: (_, record) => {
                const grade = (record?.summary?.reduce((a: any, b: any) => a + b.nilai, 0) || 1) / (record?.summary?.length || 1);
                return <p className="m-0 capitalize">{(grade as number)?.toFixed(1)}</p>;
            },
        },
    ];

    const allGrades = (data: typeof getMyGradesQuery.data) => {
        let grades: any[] = [];
        data?.forEach((el) => {
            el.grades?.forEach((g) => {
                if (grades.find((gr) => gr.mata_pelajaran === g.mata_pelajaran)) {
                    grades = grades.map((gr) => {
                        if (gr.mata_pelajaran !== g.mata_pelajaran) return gr;
                        return {
                            mata_pelajaran: gr.mata_pelajaran,
                            summary: [...(gr?.summary || []), { nilai: g.nilai, semester: el.semester }],
                        };
                    });
                    return;
                }
                grades.push({ mata_pelajaran: g.mata_pelajaran, summary: [{ nilai: g.nilai, semester: el.semester }] });
            });
        });
        return grades;
    };

    const addAverageGrades = getMyGradesQuery.data?.length
        ? [...getMyGradesQuery.data, { semester: "rata-rata", grades: allGrades(getMyGradesQuery.data) }]
        : [];

    const items: TabsProps["items"] = addAverageGrades?.map((grade) => ({
        key: grade.semester,
        label:
            grade.semester === "rata-rata"
                ? "Rata - Rata"
                : `KELAS ${CLASSES_SEMESTER[Number(grade.semester) - 1]} - SEMESTER ${Number(grade.semester) % 2 !== 0 ? 1 : 2}`,
        children: (
            <Table
                rowKey={(i) => i.mata_pelajaran}
                columns={grade.semester === "rata-rata" ? columnsAverage : columns}
                dataSource={grade.grades}
                pagination={{ position: ["none" as any], pageSize: 100 }}
                summary={
                    grade.semester !== "rata-rata"
                        ? () => (
                              <Table.Summary>
                                  <Table.Summary.Row>
                                      <Table.Summary.Cell index={0}>
                                          <span className="font-semibold">Rata-Rata</span>{" "}
                                      </Table.Summary.Cell>
                                      <Table.Summary.Cell index={1}>
                                          <span className="font-semibold">
                                              {((grade?.grades?.reduce((a, b) => a + b.nilai, 0) || 0) / (grade?.grades?.length || 1)).toFixed(1)}
                                          </span>
                                      </Table.Summary.Cell>
                                  </Table.Summary.Row>
                              </Table.Summary>
                          )
                        : undefined
                }
            />
        ),
    }));

    return (
        <div className="w-full pb-20">
            <h1 className="m-0 mb-10 pt-4">Nilai akhir siswa</h1>
            <StateRender data={getMyGradesQuery.data} isLoading={getMyGradesQuery.isLoading} isError={getMyGradesQuery.isError}>
                <StateRender.Data>
                    <div className="grid w-full grid-cols-1 gap-10 mt-10">
                        {getMyGradesQuery.data?.length ? (
                            <>
                                <Card>
                                    <Line data={dataChart as any} options={options} />
                                </Card>
                                <Tabs type="card" items={items} />
                            </>
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
