import { Button, List, Popconfirm, Space, message } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import ModalTemplate, { HandlerProps } from "components/modal/template";
import { UserContext } from "context/user";
import dayjs from "dayjs";
import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import { Staff } from "modules/datastaff/table";
import { SppTable } from "modules/sppsiswa/spp-month-table";
import { useMutation, useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { FORMAT_DATE_DAYJS, SPP_PAYMENT_METHOD } from "utils/constant";
import { useContext } from "react";
import ModalRejectSpp from "./modal-reject-spp";

type Props = {
    children: (data: HandlerProps) => void;
};

const getNotLegalizeSpp = httpsCallable(functionInstance, "getNotLegalizeSpp");
const getStaffs = httpsCallable(functionInstance, "getStaffs");
const getStudents = httpsCallable(functionInstance, "getStudents");
const setLegalizeSpp = httpsCallable(functionInstance, "setLegalizeSpp");
const setRejectSpp = httpsCallable(functionInstance, "setRejectSpp");

function ModalValidateSpp({ children }: Props) {
    const { state } = useContext(UserContext);

    const setLegalizeSppMutate = useMutation(
        ["set-legalize-spp"],
        async (data: any) => {
            return (await setLegalizeSpp(data)).data;
        },
        {
            onError(e: any) {
                message.error(e?.message);
            },
        }
    );

    const setRejectSppMutate = useMutation(
        ["set-reject-spp"],
        async (data: any) => {
            return (await setRejectSpp(data)).data;
        },
        {
            onError(e: any) {
                message.error(e?.message);
            },
        }
    );

    const getNotLegalizeSppQuery = useQuery(["getNotLegalizeSpp"], async () => {
        return (await getNotLegalizeSpp()).data as SppTable[];
    });

    const studentQuery = useQuery(["get-student"], async () => {
        return (await getStudents()).data as Siswa[];
    });

    const getStaffsQuery = useQuery(["get-staff"], async () => {
        return (await getStaffs()).data as Staff[];
    });

    const onConfirm = (spp: SppTable) => {
        return () => {
            setLegalizeSppMutate
                .mutateAsync({
                    id: spp.id,
                    student_id: spp.student_id,
                    class: spp.class,
                    month: spp.month,
                    legalized: state?.user?.id,
                })
                .then(() => {
                    getNotLegalizeSppQuery.refetch();
                });
        };
    };

    const onReject = (spp: SppTable) => {
        return (val: { reason: string }) => {
            setRejectSppMutate
                .mutateAsync({
                    id: spp.id,
                    student_id: spp.student_id,
                    class: spp.class,
                    month: spp.month,
                    reason: val.reason,
                })
                .then(() => {
                    getNotLegalizeSppQuery.refetch();
                });
        };
    };

    const columns: ColumnsType<SppTable> = [
        {
            title: "Siswa",
            dataIndex: "student_id",
            render: (text) => {
                const siswa = studentQuery.data?.find((st) => st.id === text);
                return (
                    <p className="m-0 capitalize">
                        {siswa?.nama} <span className="font-semibold">{siswa?.kelas ? `-${siswa?.kelas}` : ""}</span>
                    </p>
                );
            },
        },
        {
            title: "Bulan",
            dataIndex: "month",
            render: (text) => <p className="m-0 capitalize">{text}</p>,
        },
        {
            title: "Tanggal Bayar",
            dataIndex: "pay_date",
            render: (text) => <p className="m-0">{text ? dayjs(text).format(FORMAT_DATE_DAYJS) : ""}</p>,
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
            title: "Aksi",
            dataIndex: "-",
            render: (_, record) => (
                <Space>
                    <Popconfirm title="Sahkan pembayaran spp?" onConfirm={onConfirm(record)} okText="Ya" cancelText="Batal">
                        <Button type="primary">Sahkan</Button>
                    </Popconfirm>
                    <ModalRejectSpp onSubmit={onReject(record)}>
                        {(ctrl) => (
                            <Button type="primary" danger onClick={ctrl.openModal}>
                                Tolak
                            </Button>
                        )}
                    </ModalRejectSpp>
                </Space>
            ),
        },
    ];

    return (
        <ModalTemplate width={1200} title="Pengesahan pembayaran spp" handlerInComponent={children} footer={null}>
            {(ctrl) => (
                <div className="flex flex-col gap-5 mt-5">
                    <Table
                        rowKey={(record) => record.id!}
                        size="small"
                        columns={columns}
                        dataSource={getNotLegalizeSppQuery.data || []}
                        loading={getNotLegalizeSppQuery.isLoading || setLegalizeSppMutate.isLoading || setRejectSppMutate.isLoading}
                        className="w-full"
                    />
                </div>
            )}
        </ModalTemplate>
    );
}

export default ModalValidateSpp;
