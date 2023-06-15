import { Skeleton } from "antd";
import dayjs from "dayjs";
import { httpsCallable } from "firebase/functions";
import React from "react";
import { useMutation, useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { FORMAT_DATE_DAYJS, MONTHS } from "utils/constant";
import { UserContext } from "context/user";
import TableSppMonth, { SppTable } from "./spp-month-table";

type Props = { cls: string; currentCls?: string; studentId: any };

const getSPP = httpsCallable(functionInstance, "getSPP");
const setSPP = httpsCallable(functionInstance, "setSPP");

function TableDetailSpp({ cls, currentCls, studentId }: Props) {
    const [monthSpp, setMonthSpp] = React.useState<SppTable[]>([]);
    const { state } = React.useContext(UserContext);

    const getSPPQuery = useQuery(
        ["get-spp", cls, studentId],
        async () => {
            return (await getSPP({ class: cls, student_id: studentId })).data;
        },
        {
            enabled: !!studentId,
            staleTime: undefined,
            onSuccess: (data: any) => {
                setMonthSpp(
                    MONTHS.map(
                        (m) =>
                            ({
                                month: m,
                                pay_date: data && data[m]?.pay_date ? dayjs(data[m]?.pay_date, FORMAT_DATE_DAYJS) : "",
                                note: data ? data[m]?.note : "",
                                amount: data ? data[m]?.amount : "",
                                method: data ? data[m]?.method : "",
                                author_id: data ? data[m]?.author_id : "",
                            } as SppTable)
                    )
                );
            },
        }
    );

    const setSPPMutate = useMutation(["set-spp"], async (data: any) => {
        return (await setSPP(data)).data;
    });

    const onEdit = (spp: SppTable[], prevEditRow: any) => {
        setSPP(spp);
        const tSpp = spp?.reduce(
            (obj, item) =>
                Object.assign(obj, {
                    [item.month?.toLowerCase() as any]: {
                        amount: item.amount,
                        note: item.note,
                        method: item.method,
                        pay_date: item.pay_date ? dayjs(item.pay_date).format(FORMAT_DATE_DAYJS) : "",
                        author_id: prevEditRow?.month === item.month ? state?.user?.id : item.author_id,
                    },
                }),
            {}
        );

        setSPPMutate
            .mutateAsync({
                class: cls,
                student_id: studentId,
                history: tSpp,
            })
            .finally(() => {
                getSPPQuery.refetch();
            });
    };

    if (!currentCls) return <Skeleton active />;

    return <TableSppMonth loading={getSPPQuery.isLoading} cls={cls} currentCls={currentCls} list={monthSpp} onSetList={onEdit} />;
}

export default TableDetailSpp;
