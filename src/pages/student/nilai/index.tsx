import { Alert, Skeleton } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import StateRender from "components/common/state";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import { Nilai } from "modules/nilaisiswa/table-nilai";
import { useContext } from "react";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { CLASSES_SEMESTER } from "utils/constant";
import Lottie from "react-lottie";
import gradeAnimation from "assets/animation/grades.json";

const getMyGrades = httpsCallable(functionInstance, "getMyGrades");

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
                    })),
                };
            });

            return listGradesPerSemester || [];
        },
        {
            enabled: !!state?.user?.id,
        }
    );

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
            title: "Catatan",
            dataIndex: "catatan",
            render: (text) => <p className="m-0 capitalize">{text}</p>,
        },
    ];

    return (
        <div className="w-full">
            <StateRender data={getMyGradesQuery.data} isLoading={getMyGradesQuery.isLoading} isError={getMyGradesQuery.isError}>
                <StateRender.Data>
                    <h1 className="m-0 mb-10 pt-4">Nilai akhir siswa</h1>
                    <div className="grid w-full grid-cols-2 gap-10">
                        {getMyGradesQuery.data?.length ? (
                            getMyGradesQuery.data?.map((el) => (
                                <div className="" key={el.semester}>
                                    <p>
                                        KELAS {CLASSES_SEMESTER[Number(el.semester) - 1]} - SEMESTER {Number(el.semester) % 2 !== 0 ? 1 : 2}
                                    </p>
                                    <Table
                                        rowKey={(i) => i.mata_pelajaran}
                                        columns={columns as any}
                                        dataSource={el.grades}
                                        pagination={{ position: ["none" as any], pageSize: 100 }}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 flex flex-col items-center justify-center h-[400px]">
                                <Lottie options={defaultOptions} height={400} width={400} isClickToPauseDisabled={false} />
                                <p className="m-0 text-xl text-gray-500 -translate-y-20">Daftar nilai belum ada</p>
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
