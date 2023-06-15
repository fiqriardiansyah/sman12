import { Alert, Card, Descriptions, Skeleton, Space, Tabs, TabsProps } from "antd";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import TableAbsence from "modules/absensisiswa/table-absence";
import React, { useState, useTransition } from "react";
import { Kelas } from "modules/datakelas/table";
import moment from "moment";
import { IoMdArrowBack } from "react-icons/io";
import { useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { MONTHS, STAFF_PATH } from "utils/constant";

export type DetailAttendance = {
    status: "h" | "i" | "a" | "l" | "x" | "n";
    desc: string;
};

export type Attendance = {
    [date: number]: DetailAttendance;
};

export type Absences = {
    id?: string;
    name?: string;
    attendance: Attendance | null;
};
const detailClass = httpsCallable(functionInstance, "detailClass");

function InfoSiswaAbsensiEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [currentMonth, setCurrentMonth] = useState<string>(moment(moment.now()).format("MMMM").toLowerCase());

    const detailClassQuery = useQuery(["get-class", id], async () => {
        return (await detailClass({ id })).data as Kelas;
    });

    const onChangeTab = (key: any) => {
        setCurrentMonth(key);
    };

    const clickGoBack = (e: any) => {
        e.preventDefault();
        navigate(-1);
    };

    const tabHistory = React.useCallback(() => {
        const items = MONTHS?.map((m) => ({
            key: m?.toLowerCase(),
            label: m?.CapitalizeEachFirstLetter(),
            children: <TableAbsence students={detailClassQuery.data?.murid} month={m} cls={detailClassQuery.data?.kelas} />,
        }));
        return <Tabs activeKey={currentMonth?.toString()} items={items} onChange={onChangeTab} />;
    }, [detailClassQuery.data?.kelas, detailClassQuery.data?.nomor_kelas, currentMonth]);

    if (!id) return <Alert type="error" message="data tidak ditemukan" />;

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to=".." onClick={clickGoBack}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Edit Absensi Siwa</h1>
                </Space>
            </div>
            <StateRender data={detailClassQuery.data} isLoading={detailClassQuery.isLoading} isError={detailClassQuery.isError}>
                <StateRender.Data>
                    <Card>
                        <Descriptions title={`Kelas ${detailClassQuery.data?.kelas}${detailClassQuery.data?.nomor_kelas}, TA 2022/2023`}>
                            <Descriptions.Item label="Wali Kelas">{detailClassQuery.data?.wali_nama?.CapitalizeEachFirstLetter()}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton active />
                </StateRender.Loading>
            </StateRender>
            <div className="bg-white p-2">{tabHistory()}</div>
        </div>
    );
}

export default InfoSiswaAbsensiEdit;
