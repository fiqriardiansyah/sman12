import { Alert, Skeleton, Table, Tabs, TabsProps, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import collegeAnimation from "assets/animation/college.json";
import StateRender from "components/common/state";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import moment from "moment";
import { useContext, useState } from "react";
import Lottie from "react-lottie";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import Utils from "utils";
import { CLASSES, MONTHS } from "utils/constant";

const getMySPP = httpsCallable(functionInstance, "getMySPP");

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: collegeAnimation,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

function StudentSPP() {
    const { state } = useContext(UserContext);

    const [tabClass, setTabClass] = useState<string>(Utils.SplitStrKelas(state?.user?.kelas));

    const getMySPPQuery = useQuery(
        ["get-my-grades", state?.user?.id],
        async () => {
            const result = (await getMySPP({ student_id: state?.user?.id })).data as any;
            const historySPP = CLASSES.map((cls) => {
                const history = result ? result[cls] : null;
                return {
                    kelas: cls,
                    history: MONTHS.map((month) => ({
                        month,
                        amount: history ? history[month].amount : "",
                        pay_date: history ? history[month].pay_date : "",
                        note: history ? history[month].note : "",
                        kelas: cls,
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
            enabled: !!state?.user?.id,
        }
    );

    const columns: ColumnsType<any> = [
        {
            title: "Bulan",
            dataIndex: "month",
            width: "200px",
            render: (text, record) => {
                const isSameOrBeforeMonth = MONTHS.indexOf((record.month as any) || "") <= MONTHS.indexOf(moment().format("MMMM")?.toLowerCase());
                const isDebt =
                    isSameOrBeforeMonth && record.kelas?.length <= Utils.SplitStrKelas(state?.user?.kelas)?.length && (!record.pay_date as any);
                return (
                    <p className="m-0 capitalize flex">
                        {text}
                        {isDebt ? (
                            <Tag className="ml-4" color="magenta">
                                menunggak
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
            title: "Keterangan",
            dataIndex: "note",
            render: (text) => <p className="m-0">{text}</p>,
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
        <div className="w-full">
            <h1 className="m-0 mb-10 pt-4">Catatan SPP siswa</h1>
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
        </div>
    );
}

export default StudentSPP;
