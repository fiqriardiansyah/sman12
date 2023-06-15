import { Alert, Skeleton, Tabs, TabsProps } from "antd";
import teacherAnimation from "assets/animation/teacher.json";
import StateRender from "components/common/state";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import RosterTable from "modules/datapelajaran/roster-table";
import { useContext } from "react";
import Lottie from "react-lottie";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { DAYS } from "utils/constant";

const getMyRoster = httpsCallable(functionInstance, "getMyRoster");

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: teacherAnimation,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

function StudentMataPelajaran() {
    const { state } = useContext(UserContext);

    const getMyRosterQuery = useQuery(
        ["get-my-roster", state?.user?.kelas_id],
        async () => {
            const result = (await getMyRoster({ kelas_id: state?.user?.kelas_id })).data as any;
            return result;
        },
        {
            enabled: !!state?.user?.kelas_id,
        }
    );

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
                    <p className="m-0 text-xl text-gray-500">Kamu belum terdaftar dikelas manapun</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h1 className="m-0 mb-10 pt-4">Mata Pelajaran</h1>
            <StateRender data={getMyRosterQuery.data} isLoading={getMyRosterQuery.isLoading} isError={getMyRosterQuery.isError}>
                <StateRender.Data>
                    <Tabs type="card" items={items} />
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(getMyRosterQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default StudentMataPelajaran;
