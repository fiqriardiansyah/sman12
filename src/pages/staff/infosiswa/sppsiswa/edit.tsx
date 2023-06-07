import { Card, Descriptions, Space, Tabs, TabsProps } from "antd";
import TableDetailSpp from "modules/sppsiswa/class-month-table";
import { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
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

const dummySpp: Spp = {
    X: {
        july: {
            amount: 10000,
            note: "test test",
            pay_date: "12 may 2023",
        },
        august: {
            amount: 23000,
            note: "adfasdfadf",
            pay_date: "12 may 2023",
        },
    },
    XI: {
        july: {
            amount: 20000,
            note: "",
            pay_date: "12 may 2023",
        },
    },
};

function InfoSiswaSppEdit() {
    const currentClass = "X";
    const [tabClass, setTabClass] = useState<string>(currentClass);
    const [spp, setSpp] = useState<Spp | {}>({ ...dummySpp });

    const items: TabsProps["items"] = CLASSES.map((cls) => ({
        key: cls,
        label: `Kelas ${cls}`,
        children: <TableDetailSpp currentCls={currentClass} cls={cls} spp={spp[cls as keyof typeof spp]} />,
    }));

    const onChange = (key: string) => {
        setTabClass(key);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to={STAFF_PATH.infosiswa.sppsiswa.index}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Edit Spp Siswa</h1>
                </Space>
            </div>
            <Card>
                <Descriptions title="Detail Siswa">
                    <Descriptions.Item label="Nama">Zhou Maomao</Descriptions.Item>
                    <Descriptions.Item label="NIS">1810000000</Descriptions.Item>
                    <Descriptions.Item label="NISN">234563456345</Descriptions.Item>
                    <Descriptions.Item label="Kelas">XII IPA 1</Descriptions.Item>
                    <Descriptions.Item label="Alamat">No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China</Descriptions.Item>
                </Descriptions>
            </Card>
            <Tabs activeKey={tabClass} items={items} onChange={onChange} />
        </div>
    );
}

export default InfoSiswaSppEdit;
