import { Alert, Skeleton, Table, Tabs, TabsProps, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import collegeAnimation from "assets/animation/college.json";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import { Staff } from "modules/datastaff/table";
import moment from "moment";
import { useState } from "react";
import { HiBadgeCheck } from "react-icons/hi";
import Lottie from "react-lottie";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import Utils from "utils";
import { CLASSES, FORMATE_DATE_TIME, MONTHS, SPP_PAYMENT_METHOD } from "utils/constant";

const getMySPP = httpsCallable(functionInstance, "getMySPP");

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: collegeAnimation,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

const getStaffs = httpsCallable(functionInstance, "getStaffs");

function ViewSppHistory({ kelas, studentId }: { kelas: any; studentId: any }) {
    const [tabClass, setTabClass] = useState<string>(kelas === "LULUS" ? "XII" : Utils.SplitStrKelas(kelas));

    const getStaffsQuery = useQuery(["get-staff"], async () => {
        return (await getStaffs()).data as Staff[];
    });

    const getMySPPQuery = useQuery(
        ["get-my-spp", studentId],
        async () => {
            const result = (await getMySPP({ student_id: studentId })).data as any;
            const historySPP = CLASSES.map((cls) => {
                const history = result ? result[cls] : null;
                return {
                    kelas: cls,
                    history: MONTHS.map((month) => ({
                        month,
                        amount: history ? history[month]?.amount : "",
                        pay_date: history ? history[month]?.pay_date : "",
                        note: history ? history[month]?.note : "",
                        author_id: history ? history[month]?.author_id : "",
                        method: history ? history[month]?.method : "",
                        kelas: cls,
                        legalized: history ? history[month]?.legalized : "",
                        legalized_date:
                            history && history[month]?.legalized_date ? moment(history[month]?.legalized_date).format(FORMATE_DATE_TIME) : "",
                    })),
                };
            });

            const sortMonthHistory = historySPP?.map((history) => {
                return {
                    ...history,
                    history: MONTHS.map((month) => history.history.find((val) => val?.month === month)),
                };
            });

            return sortMonthHistory || [];
        },
        {
            enabled: !!studentId,
        }
    );

    const columns: ColumnsType<any> = [
        {
            title: "Bulan",
            dataIndex: "month",
            width: "200px",
            render: (text, record) => {
                if (kelas === "LULUS") return <p className="m-0 capitalize flex">{text}</p>;
                const isSameOrBeforeMonth = MONTHS.indexOf((record.month as any) || "") <= MONTHS.indexOf(moment().format("MMMM")?.toLowerCase());
                const isDebt = isSameOrBeforeMonth && record.kelas?.length <= Utils.SplitStrKelas(kelas)?.length && (!record.pay_date as any);
                return (
                    <p className="m-0 capitalize flex">
                        {text}
                        {isDebt ? (
                            <Tag className="ml-4" color="magenta">
                                belum lunas
                            </Tag>
                        ) : null}
                    </p>
                );
            },
        },
        {
            title: "Tanggal Bayar",
            dataIndex: "pay_date",
            render: (text) => <p className="m-0">{text}</p>,
        },
        {
            title: "Jumlah",
            dataIndex: "amount",
            render: (text) => <p className="m-0">{text ? (text as number)?.ToIndCurrency("Rp") : ""}</p>,
        },
        {
            title: "Metode Bayar",
            dataIndex: "method",
            render: (text) => <p className="m-0">{text ? SPP_PAYMENT_METHOD.find((el) => el.value === text)?.label : ""}</p>,
        },
        {
            title: "Keterangan",
            dataIndex: "note",
            render: (text) => <p className="m-0">{text}</p>,
        },
        {
            title: "Dibuat oleh",
            dataIndex: "author_id",
            render: (text) => <p className="m-0">{text ? getStaffsQuery.data?.find((staff) => staff.id === text)?.nama : ""}</p>,
        },
        {
            title: "Disahkan",
            dataIndex: "legalized",
            render: (text, record) => {
                if (!text) return "";
                return (
                    <div className="flex items-center">
                        <HiBadgeCheck className="text-green-400 text-xl mr-2" />
                        <div className="">
                            <p className="m-0 text-green-500 text-sm capitalize leading-none">
                                {text ? getStaffsQuery.data?.find((staff) => staff.id === text)?.nama : ""}
                            </p>
                            <p className="m-0 text-gray-500 text-sm capitalize leading-none">{record.legalized_date}</p>
                        </div>
                    </div>
                );
            },
        },
    ];

    const onChange = (key: string) => {
        setTabClass(key);
    };

    const items: TabsProps["items"] = getMySPPQuery.data?.map((el) => ({
        key: el.kelas,
        label: `Kelas ${el.kelas}`,
        children: (
            <Table
                rowKey={(i) => i.month}
                columns={columns as any}
                dataSource={el.history as any}
                pagination={{ position: ["none" as any], pageSize: 100 }}
            />
        ),
    }));

    return (
        <StateRender data={getMySPPQuery.data} isLoading={getMySPPQuery.isLoading} isError={getMySPPQuery.isError}>
            <StateRender.Data>
                {getMySPPQuery.data?.length ? (
                    <Tabs activeKey={tabClass} items={items} onChange={onChange} />
                ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center h-[400px]">
                        <Lottie options={defaultOptions} height={400} width={400} isClickToPauseDisabled={false} />
                        <p className="m-0 text-xl text-gray-500">Catatan SPP belum tersedia</p>
                    </div>
                )}
            </StateRender.Data>
            <StateRender.Loading>
                <Skeleton />
            </StateRender.Loading>
            <StateRender.Error>
                <Alert type="error" message={(getMySPPQuery.error as any)?.message} />
            </StateRender.Error>
        </StateRender>
    );
}

export default ViewSppHistory;
