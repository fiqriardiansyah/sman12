/* eslint-disable react/no-array-index-key */
import { Card, Tabs, TabsProps } from "antd";
import { UserContext } from "context/user";
import MonthHistory from "modules/absensi[siswa]/mont-history";
import React from "react";
import Utils from "utils";
import { CLASSES } from "utils/constant";

function StudentAbsensi() {
    const { state } = React.useContext(UserContext);

    const [tabClass, setTabClass] = React.useState<string>(Utils.SplitStrKelas(state?.user?.kelas));

    const onChange = (key: string) => {
        setTabClass(key);
    };

    const items: TabsProps["items"] = CLASSES?.map((cls) => ({
        key: cls,
        label: `Kelas ${cls}`,
        children: <MonthHistory cls={cls} studentId={state?.user?.id} />,
    }));

    return (
        <div className="w-full">
            <h1 className="m-0 mb-10 pt-4">Kehadiran siswa</h1>
            <Card>
                <Tabs activeKey={tabClass} items={items} onChange={onChange} />
            </Card>
        </div>
    );
}

export default StudentAbsensi;
