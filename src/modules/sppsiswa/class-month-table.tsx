import { MONTHS } from "utils/constant";
import { useState, useEffect } from "react";
import { Spp } from "pages/staff/infosiswa/sppsiswa/edit";
import { Skeleton } from "antd";
import { functionInstance } from "service/firebase-instance";
import { httpsCallable } from "firebase/functions";
import { useMutation, useQuery } from "react-query";
import TableSppMonth, { SppTable } from "./spp-month-table";

type Props = { cls: string; currentCls?: string; studentId: any };

const getSPP = httpsCallable(functionInstance, "getSPP");
const setSPP = httpsCallable(functionInstance, "setSPP");

function TableDetailSpp({ cls, currentCls, studentId }: Props) {
    const [monthSpp, setMonthSpp] = useState<SppTable[]>([]);

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
                                pay_date: data ? data[m]?.pay_date : "",
                                note: data ? data[m]?.note : "",
                                amount: data ? data[m]?.amount : "",
                            } as SppTable)
                    )
                );
            },
        }
    );

    const setSPPMutate = useMutation(["set-spp"], async (data: any) => {
        return (await setSPP(data)).data;
    });

    const onEdit = (spp: SppTable[]) => {
        const tSpp = spp?.reduce(
            (obj, item) =>
                Object.assign(obj, { [item.month?.toLowerCase() as any]: { amount: item.amount, note: item.note, pay_date: item.pay_date } }),
            {}
        );

        setSPPMutate.mutateAsync({
            class: cls,
            student_id: studentId,
            history: tSpp,
        });
    };

    if (!currentCls) return <Skeleton active />;

    return (
        <TableSppMonth loading={getSPPQuery.isLoading} cls={cls} currentCls={currentCls} list={monthSpp} setList={setMonthSpp} onSetList={onEdit} />
    );
}

export default TableDetailSpp;
