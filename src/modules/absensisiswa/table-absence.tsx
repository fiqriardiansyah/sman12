/* eslint-disable react/no-array-index-key */
import { Siswa } from "modules/datasiswa/table";
import { Absences } from "pages/staff/infosiswa/absensisiswa/edit";
import { httpsCallable } from "firebase/functions";
import { functionInstance } from "service/firebase-instance";
import { useMutation, useQuery } from "react-query";
import StateRender from "components/common/state";
import { Skeleton, Spin, message } from "antd";
import React from "react";
import { ABSEN_STATUS, COUNT_ABSENT, TOTAL_DAY } from "utils/constant";
import BoxAbsence from "./box-absence";
import BoxDate from "./box-date";

const getAttandanceHistory = httpsCallable(functionInstance, "getAttendanceHistory");
const setOneAttendance = httpsCallable(functionInstance, "setOneAttendance");
const setMultipleAttendance = httpsCallable(functionInstance, "setMultipleAttendance");

type Props = { month: string; students?: Siswa[]; cls?: string; canInteract?: boolean };

function TableAbsence({ month, students, cls, canInteract = true }: Props) {
    const setAttendanceMutate = useMutation(["set-attendance"], async (data: any) => {
        return (await setOneAttendance(data)).data;
    });

    const setManyAttendanceMutate = useMutation(["set-many-attendance"], async (data: any) => {
        return (await setMultipleAttendance(data)).data;
    });

    const attendancesQuery = useQuery(
        ["getAttandances", month, cls, students?.map((el) => el.id)],
        async () => {
            return (await getAttandanceHistory({ students, month, cls })).data as Absences[];
        },
        {
            staleTime: undefined,
        }
    );

    const tAttendances = attendancesQuery.data?.map((el) => ({
        ...el,
        name: students?.find((st) => st.id === el.id)?.nama,
    }));

    const onChangeAttendance = (id: any) => {
        return (data: any) => {
            setAttendanceMutate
                .mutateAsync({
                    detail: data.detail,
                    student_id: id,
                    cls,
                    month,
                    date: data.date,
                })
                .catch((e: any) => {
                    message.error(e?.message);
                })
                .finally(() => {
                    attendancesQuery.refetch();
                });
        };
    };

    const onChangeManyAttendance = (date: any) => {
        return (status: string) => {
            setManyAttendanceMutate
                .mutateAsync({
                    date,
                    detail: {
                        status,
                        desc: "",
                    },
                    students_id: students?.map((s) => s.id) || [],
                    cls,
                    month,
                })
                .then((res) => {
                    message.success("Berhasil set data");
                    attendancesQuery.refetch();
                })
                .catch((e: any) => {
                    message.error(e?.message);
                });
        };
    };

    const renderHistory = React.useMemo(() => {
        return tAttendances?.map((absence) => {
            const absenceThisMonth = absence.attendance;
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
                    <p className="w-[150px] font-semibold m-0 text-black capitalize line-clamp-1">{absence.name}</p>
                    <div className="w-full flex justify-evenly gap-[1px]">
                        {[...new Array(TOTAL_DAY)]?.map((_, i) => {
                            if (!absenceThisMonth || Object.keys(absenceThisMonth).length === 0) {
                                return <BoxAbsence canInteract={canInteract} onChange={onChangeAttendance(absence.id)} date={i + 1} />;
                            }
                            return (
                                <BoxAbsence
                                    canInteract={canInteract}
                                    onChange={onChangeAttendance(absence.id)}
                                    detail={absenceThisMonth[i + 1]}
                                    date={i + 1}
                                />
                            );
                        })}
                    </div>
                    <div className="w-[80px] flex items-center gap-[5px] ml-[5px]">
                        {[count.hadir, count.absen, count.izin, count.sakit]?.map((el, i) => (
                            <div className="m-0 w-full text-black font-semibold" title={COUNT_ABSENT[i]?.CapitalizeFirstLetter()}>
                                {el}
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    }, [attendancesQuery.data]);

    return (
        <div className="w-full flex flex-col relative">
            {setManyAttendanceMutate.isLoading && (
                <div className="absolute top-0 left-0 bottom-0 right-0 bg-opacity-20 bg-black flex items-center justify-center">
                    <Spin size="large" />
                </div>
            )}
            <div className="w-full bg-blue-400 p-3 flex items-stretch mb-3">
                <p className="font-semibold w-[150px] m-0 text-white">Nama</p>
                <div className="h-5 bg-white w-1px" />
                <div className="w-full flex justify-evenly">
                    {[...new Array(TOTAL_DAY)]?.map((_, i) => (
                        <BoxDate
                            canInteract={canInteract}
                            loading={setManyAttendanceMutate.isLoading}
                            onChange={onChangeManyAttendance(i + 1)}
                            date={i + 1}
                            key={i}
                        />
                    ))}
                </div>
                <div className="w-[80px] flex items-center gap-[5px] ml-[5px]">
                    {COUNT_ABSENT?.map((el) => (
                        <div
                            className="m-0 w-full text-black font-semibold"
                            title={ABSEN_STATUS[el.toLowerCase() as keyof typeof ABSEN_STATUS]?.CapitalizeFirstLetter()}
                        >
                            {el?.CapitalizeFirstLetter()}
                        </div>
                    ))}
                </div>
            </div>
            <StateRender data={attendancesQuery.data} isLoading={attendancesQuery.isLoading} isError={attendancesQuery.isError}>
                <StateRender.Data>{renderHistory}</StateRender.Data>
                <StateRender.Loading>
                    <Skeleton active />
                </StateRender.Loading>
            </StateRender>
        </div>
    );
}

export default React.memo(TableAbsence);
