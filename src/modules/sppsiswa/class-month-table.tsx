import { MONTHS } from "utils/constant";
import { useState, useEffect } from "react";
import { Spp } from "pages/staff/infosiswa/sppsiswa/edit";
import TableSppMonth, { SppTable } from "./spp-month-table";

function TableDetailSpp({ spp, cls, currentCls }: { spp?: Spp; cls: string; currentCls: string }) {
    const [monthSpp, setMonthSpp] = useState<SppTable[]>([]);

    useEffect(() => {
        setMonthSpp(
            MONTHS.map(
                (m) =>
                    ({
                        month: m,
                        pay_date: spp ? spp[m]?.pay_date : "",
                        note: spp ? spp[m]?.note : "",
                        amount: spp ? spp[m]?.amount : "",
                    } as SppTable)
            )
        );
    }, [spp]);

    return <TableSppMonth cls={cls} currentCls={currentCls} list={monthSpp} setList={setMonthSpp} />;
}

export default TableDetailSpp;
