/* eslint-disable react/no-array-index-key */
import { Alert, Skeleton } from "antd";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import BoxAbsence from "modules/absensisiswa/box-absence";
import BoxDate from "modules/absensisiswa/box-date";
import React from "react";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { ABSEN_STATUS, COUNT_ABSENT, MONTHS, TOTAL_DAY } from "utils/constant";

const getMyAttendance = httpsCallable(functionInstance, "getMyAttendance");

type MonthHistoryProps = {
    cls: any;
    studentId: any;
};

function MonthHistory({ cls, studentId }: MonthHistoryProps) {
    const getMyAttendanceQuery = useQuery(["getMyAttendance", cls, studentId], async () => {
        return (await getMyAttendance({ student_id: studentId })).data as any;
    });

    const monthHistory = getMyAttendanceQuery.data ? getMyAttendanceQuery.data[cls] : null;

    const renderHistory = React.useMemo(() => {
        return MONTHS?.map((month) => {
            const absenceThisMonth = monthHistory ? monthHistory[month] : null;
            const count = Object.keys(absenceThisMonth || {})?.reduce(
                (prev, curr) => {
                    const status = absenceThisMonth ? absenceThisMonth[curr as any]?.status : null;
                    if (status === "h") return { ...prev, hadir: prev.hadir + 1 };
                    if (status === "a") return { ...prev, absen: prev.absen + 1 };
                    if (status === "i") return { ...prev, izin: prev.izin + 1 };
                    if (status === "s") return { ...prev, sakit: prev.sakit + 1 };
                    return prev;
                },
                {
                    hadir: 0,
                    absen: 0,
                    izin: 0,
                    sakit: 0,
                }
            );
            return (
                <div className="w-full flex items-center px-3 py-1">
                    <p className="w-[150px] font-semibold m-0 text-black capitalize line-clamp-1">{month}</p>
                    <div className="w-full flex justify-evenly gap-[1px]">
                        {[...new Array(TOTAL_DAY)]?.map((_, i) => {
                            if (!absenceThisMonth || Object.keys(absenceThisMonth || {}).length === 0) {
                                return <BoxAbsence canInteract={false} date={i + 1} />;
                            }
                            return <BoxAbsence canInteract={false} detail={absenceThisMonth ? absenceThisMonth[i + 1] : null} date={i + 1} />;
                        })}
                    </div>
                    <div className="w-[80px] flex items-center gap-[5px] ml-[5px]">
                        {[count.hadir, count.absen, count.izin, count.sakit]?.map((el, i) => (
                            <div key={i} className="m-0 w-full text-black font-semibold" title={COUNT_ABSENT[i]?.CapitalizeFirstLetter()}>
                                {el}
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    }, [getMyAttendanceQuery.data]);

    return (
        <StateRender data={getMyAttendanceQuery.isFetched} isLoading={getMyAttendanceQuery.isLoading} isError={getMyAttendanceQuery.isError}>
            <StateRender.Data>
                <div className="w-full bg-blue-400 p-3 flex items-stretch mb-3">
                    <p className="font-semibold w-[150px] m-0 text-white">Bulan</p>
                    <div className="h-5 bg-white w-1px" />
                    <div className="w-full flex justify-evenly">
                        {[...new Array(TOTAL_DAY)]?.map((_, i) => (
                            <BoxDate date={i + 1} key={i} canInteract={false} />
                        ))}
                    </div>
                    <div className="w-[80px] flex items-center gap-[5px] ml-[5px]">
                        {COUNT_ABSENT?.map((el) => (
                            <div
                                key={el}
                                className="m-0 w-full text-black font-semibold"
                                title={ABSEN_STATUS[el.toLowerCase() as keyof typeof ABSEN_STATUS]?.CapitalizeFirstLetter()}
                            >
                                {el?.CapitalizeFirstLetter()}
                            </div>
                        ))}
                    </div>
                </div>
                {renderHistory}
            </StateRender.Data>
            <StateRender.Loading>
                <Skeleton />
            </StateRender.Loading>
            <StateRender.Error>
                <Alert type="error" message={(getMyAttendanceQuery.error as any)?.message} />
            </StateRender.Error>
        </StateRender>
    );
}

export default MonthHistory;
