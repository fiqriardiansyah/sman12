import { Alert, Card, Descriptions, Skeleton, Space, Tabs, TabsProps } from "antd";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import TableDetailSpp from "modules/sppsiswa/class-month-table";
import { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import Utils from "utils";
import { CLASSES, STAFF_PATH } from "utils/constant";

export type DetailSpp = {
    amount?: any;
    pay_date?: any;
    note?: any;
};

export type Spp = {
    [cls: string]: {
        [month: string]: DetailSpp;
    };
};

const getDataUser = httpsCallable(functionInstance, "getUserWithId");

function InfoSiswaSppEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tabClass, setTabClass] = useState<string>("");

    const dataUserQuery = useQuery(
        ["detail-student", id],
        async () => {
            return (await getDataUser({ id })).data as Siswa;
        },
        {
            onSuccess(data) {
                setTabClass(Utils.SplitStrKelas(data.kelas));
            },
        }
    );

    const items: TabsProps["items"] = CLASSES.map((cls) => ({
        key: cls,
        label: `Kelas ${cls}`,
        children: <TableDetailSpp studentId={id} currentCls={Utils.SplitStrKelas(dataUserQuery.data?.kelas)} cls={cls} />,
    }));

    const onChange = (key: string) => {
        setTabClass(key);
    };

    const clickGoBack = (e: any) => {
        e.preventDefault();
        navigate(-1);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to=".." onClick={clickGoBack}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Edit Spp Siswa</h1>
                </Space>
            </div>
            <StateRender data={dataUserQuery.data} isLoading={dataUserQuery.isLoading} isError={dataUserQuery.isError}>
                <StateRender.Data>
                    <Card>
                        <Descriptions title="Detail Siswa">
                            <Descriptions.Item label="Nama">{dataUserQuery?.data?.nama}</Descriptions.Item>
                            <Descriptions.Item label="NIS">{dataUserQuery.data?.nis}</Descriptions.Item>
                            <Descriptions.Item label="NISN">{dataUserQuery.data?.nisn}</Descriptions.Item>
                            <Descriptions.Item label="Kelas">{dataUserQuery.data?.kelas}</Descriptions.Item>
                            <Descriptions.Item label="Alamat">{dataUserQuery.data?.alamat}</Descriptions.Item>
                            <Descriptions.Item label="Handphone">{dataUserQuery.data?.hp}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton active />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(dataUserQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
            <Tabs activeKey={tabClass} items={items} onChange={onChange} />
        </div>
    );
}

export default InfoSiswaSppEdit;
