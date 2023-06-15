import { Alert, Card, Descriptions, Skeleton, Tabs, TabsProps } from "antd";
import teacherAnimation from "assets/animation/teacher.json";
import StateRender from "components/common/state";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import TableAbsence from "modules/absensisiswa/table-absence";
import { Kelas } from "modules/datakelas/table";
import RosterTable from "modules/datapelajaran/roster-table";
import PerwalianTableSiswa from "modules/perwalian/table-siswa";
import TableSPP from "modules/perwalian/table-spp";
import moment from "moment";
import React from "react";
import Lottie from "react-lottie";
import { useMutation, useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { DAYS, MONTHS } from "utils/constant";

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: teacherAnimation,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

const getClass = httpsCallable(functionInstance, "detailClass");
const getSPPClass = httpsCallable(functionInstance, "getSPPClass");
const getMyRoster = httpsCallable(functionInstance, "getMyRoster");

function TeacherPerwalian() {
    const { state } = React.useContext(UserContext);
    const [currentMonthAttendance, setCurrentMonthAttendance] = React.useState<string>(moment(moment.now()).format("MMMM").toLowerCase());
    const [currentMonthSPP, setCurrentMonthSPP] = React.useState<string>(moment(moment.now()).format("MMMM").toLowerCase());

    const getSPPClassMutate = useMutation(["spp-class"], async (data: any) => {
        return (await getSPPClass(data)).data;
    });

    const getMyRosterQuery = useQuery(
        ["get-my-roster", state?.user?.kelas_id],
        async (id: any) => {
            const result = (await getMyRoster({ kelas_id: state?.user?.kelas_id })).data as any;
            return result;
        },
        {
            enabled: !!state?.user?.kelas_id,
        }
    );

    const detailClassQuery = useQuery(
        ["class", state?.user?.kelas_id],
        async () => {
            return (await getClass({ id: state?.user?.kelas_id })).data as Kelas;
        },
        {
            onSuccess(data) {
                getSPPClassMutate.mutate({
                    ids: data.murid?.map((m) => m.id),
                    class: data.kelas,
                });
            },
        }
    );

    const onChangeTabAttendance = (key: any) => {
        setCurrentMonthAttendance(key);
    };

    const onChangeTabSPP = (key: any) => {
        setCurrentMonthSPP(key);
    };

    const attendanceHistory = React.useCallback(() => {
        const items = MONTHS?.map((m) => ({
            key: m?.toLowerCase(),
            label: m?.CapitalizeEachFirstLetter(),
            children: <TableAbsence canInteract={false} students={detailClassQuery.data?.murid} month={m} cls={detailClassQuery.data?.kelas} />,
        }));
        return <Tabs activeKey={currentMonthAttendance?.toString()} items={items} onChange={onChangeTabAttendance} />;
    }, [detailClassQuery.data?.kelas, detailClassQuery.data?.nomor_kelas, currentMonthAttendance]);

    const sppHistory = React.useCallback(() => {
        const items = MONTHS?.map((m) => ({
            key: m?.toLowerCase(),
            label: m?.CapitalizeEachFirstLetter(),
            children: <TableSPP sppClass={getSPPClassMutate.data} students={detailClassQuery.data?.murid} month={m} />,
        }));
        return <Tabs activeKey={currentMonthSPP?.toString()} items={items} onChange={onChangeTabSPP} />;
    }, [detailClassQuery.data?.kelas, detailClassQuery.data?.nomor_kelas, currentMonthSPP]);

    const items: TabsProps["items"] = DAYS.map((day) => ({
        key: day,
        label: day?.CapitalizeFirstLetter(),
        children: <RosterTable roster={getMyRosterQuery.data ? getMyRosterQuery.data[day] : []} />,
    }));

    if (!state?.loading && !state?.user?.kelas_id) {
        return (
            <div className="w-full">
                <h1 className="m-0 mb-10 pt-4">Mata Pelajaran</h1>
                <div className="flex flex-col items-center justify-center h-[400px]">
                    <Lottie options={defaultOptions} height={400} width={400} isClickToPauseDisabled={false} />
                    <p className="m-0 text-xl text-gray-500">Anda tidak mempunyai kelas perwalian</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-10">
            <h1 className="m-0 mb-10 pt-4">Perwalian Kelas</h1>
            <StateRender data={detailClassQuery.data} isLoading={detailClassQuery.isLoading} isError={detailClassQuery.isError}>
                <StateRender.Data>
                    <Card>
                        <Descriptions>
                            <Descriptions.Item label="Wali Kelas">{detailClassQuery?.data?.wali_nama?.CapitalizeFirstLetter()}</Descriptions.Item>
                            <Descriptions.Item label="Kelas">{`${detailClassQuery?.data?.kelas}${detailClassQuery.data?.nomor_kelas}`}</Descriptions.Item>
                            <Descriptions.Item label="Jumlah Siswa">{detailClassQuery.data?.murid?.length}</Descriptions.Item>
                        </Descriptions>
                        <p>Roster kelas</p>
                        <Tabs type="card" items={items} />
                    </Card>
                    <div className="mt-5">
                        <p className="m-0 font-semibold mb-4">Daftar siswa</p>
                        <PerwalianTableSiswa siswa={detailClassQuery.data?.murid || []} />
                    </div>
                    <div className="">
                        <p className="m-0 font-semibold mb-4">Absensi siswa</p>
                        <Card>{attendanceHistory()}</Card>
                    </div>
                    <div className="mt-10">
                        <p className="m-0 font-semibold mb-4">SPP siswa</p>
                        <Card>{sppHistory()}</Card>
                    </div>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(detailClassQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default TeacherPerwalian;
