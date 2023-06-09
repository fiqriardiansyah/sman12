import { Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import { Staff } from "modules/datastaff/table";
import moment from "moment";
import React from "react";
import { HiBadgeCheck } from "react-icons/hi";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import Utils from "utils";
import { FORMATE_DATE_TIME, MONTHS, SPP_PAYMENT_METHOD } from "utils/constant";

type Props = {
    students?: Siswa[];
    month: string;
    sppClass?: any;
};

const getStaffs = httpsCallable(functionInstance, "getStaffs");

function TableSPP({ students, month, sppClass }: Props) {
    const { state } = React.useContext(UserContext);

    const getStaffsQuery = useQuery(["get-staff"], async () => {
        return (await getStaffs()).data as Staff[];
    });

    const getHistory = (record: Siswa) => {
        if (getStaffsQuery.isLoading) return null;
        const history = sppClass?.find((spp: any) => spp.id === record.id)?.history;
        if (!history) return "";
        return history[month];
    };

    const columns: ColumnsType<Siswa> = [
        {
            title: "Nama",
            dataIndex: "nama",
            width: "200px",
            render: (text, record) => {
                if (state?.user?.kelas === "LULUS") return <p className="m-0 capitalize flex !h-fit">{text}</p>;
                const payDate = getHistory(record)?.pay_date;
                const isSameOrBeforeMonth = MONTHS.indexOf((month as any) || "") <= MONTHS.indexOf(moment().format("MMMM")?.toLowerCase());
                const isDebt =
                    isSameOrBeforeMonth &&
                    Utils.SplitStrKelas(record.kelas)?.length <= Utils.SplitStrKelas(state?.user?.kelas)?.length &&
                    (!payDate as any);
                return (
                    <p className="m-0 capitalize flex !h-fit">
                        {text}
                        {isDebt ? (
                            <Tag className="ml-4 !h-fit" color="magenta">
                                belum lunas
                            </Tag>
                        ) : null}
                    </p>
                );
            },
        },
        {
            title: "Tanggal Bayar",
            dataIndex: "-",
            render: (_, record) => <p className="m-0">{getHistory(record)?.pay_date}</p>,
        },
        {
            title: "Jumlah",
            dataIndex: "-",
            render: (_, record) => {
                const amount = getHistory(record)?.amount;
                return <p className="m-0">{amount ? (amount as number)?.ToIndCurrency("Rp") : ""}</p>;
            },
        },
        {
            title: "Metode Bayar",
            dataIndex: "-",
            render: (_, record) => <p className="m-0">{SPP_PAYMENT_METHOD.find((el) => el.value === getHistory(record)?.method)?.label || ""}</p>,
        },
        {
            title: "Keterangan",
            dataIndex: "-",
            render: (_, record) => <p className="m-0">{getHistory(record)?.note}</p>,
        },
        {
            title: "Dibuat oleh",
            dataIndex: "author_id",
            render: (_, record) => (
                <p className="m-0">{getStaffsQuery.data?.find((staff) => staff.id === getHistory(record)?.author_id)?.nama || ""}</p>
            ),
        },
        {
            title: "Disahkan",
            dataIndex: "-",
            render: (text, record) => {
                const history = getHistory(record);
                if (!history || !history?.status) return "";
                if (history?.status === "pending") return <Tag color="yellow">Pending</Tag>;
                if (history?.status === "rejected")
                    return (
                        <p className="m-0 text-red-400 text-xs">
                            <Tag color="red">Rejected</Tag>
                            <br />
                            {history?.reason}
                        </p>
                    );
                return (
                    <div className="flex items-center">
                        <HiBadgeCheck className="text-green-400 text-xl mr-2" />
                        <div className="">
                            <p className="m-0 text-green-500 text-sm capitalize leading-none">
                                {history?.legalized ? getStaffsQuery.data?.find((staff) => staff.id === history?.legalized)?.nama : ""}
                            </p>
                            <p className="m-0 text-gray-500 text-sm capitalize leading-none">
                                {moment(history?.legalized_date).format(FORMATE_DATE_TIME)}
                            </p>
                        </div>
                    </div>
                );
            },
        },
    ];

    return (
        <Table
            rowKey={(i: any) => i?.month}
            columns={columns as any}
            dataSource={students}
            pagination={{ position: ["none" as any], pageSize: 100 }}
        />
    );
}

export default TableSPP;
