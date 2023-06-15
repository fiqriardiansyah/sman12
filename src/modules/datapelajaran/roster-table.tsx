import Table, { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { httpsCallable } from "firebase/functions";
import { Pelajaran } from "pages/staff/masterdata/datapelajaran/add";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";

type Props = {
    roster?: any;
};
const getSubjects = httpsCallable(functionInstance, "getSubjects");

function RosterTable({ roster }: Props) {
    const tRoster = Object.keys(roster || {}).map((key) => ({ ...roster[key] }));

    const subjectsQuery = useQuery(["get-subject"], async () => {
        return (await getSubjects()).data as Pelajaran[];
    });

    const columns: ColumnsType<any> = [
        {
            title: "Mata Pelajaran",
            dataIndex: "mata_pelajaran",
            render: (text) => <p className="m-0 capitalize">{text ? subjectsQuery.data?.find((el) => el.id === text)?.mata_pelajaran : ""}</p>,
        },
        {
            title: "Guru",
            dataIndex: "-",
            render: (text, record) => (
                <p className="m-0 capitalize">
                    {record.mata_pelajaran ? subjectsQuery.data?.find((el) => el.id === record.mata_pelajaran)?.guru_nama : ""}
                </p>
            ),
        },
        {
            title: "Jam",
            dataIndex: "jam",
            render: (text) => <p className="m-0">{dayjs(text, "HH:mm:dd").format("HH:mm")}</p>,
        },
    ];

    return <Table columns={columns} dataSource={tRoster} loading={subjectsQuery.isLoading} rowKey={(i) => i.id} />;
}

export default RosterTable;
