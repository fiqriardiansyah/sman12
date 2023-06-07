import { Card, Descriptions, Divider, Input, Popover, Radio, RadioChangeEvent, Space, Tabs, TabsProps, Tooltip } from "antd";
import { IoMdArrowBack } from "react-icons/io";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MONTHS, STAFF_PATH } from "utils/constant";
import moment from "moment";

const dateCount = 31;

type DetailAbsence = {
    status: "h" | "i" | "a";
    desc: string;
};

type Absence = {
    [month: string]: {
        [date: number]: DetailAbsence;
    };
};

type Absences = {
    name: string;
    absence: Absence;
};

const absensi: Absences[] = [
    {
        name: "fuad bin maryam",
        absence: {},
    },
    {
        name: "fiqri ardiansyah",
        absence: {
            july: {
                1: {
                    status: "h",
                    desc: "",
                },
                2: {
                    status: "i",
                    desc: "sedang dirumah sakit",
                },
            },
            august: {
                1: {
                    status: "h",
                    desc: "",
                },
                2: {
                    status: "a",
                    desc: "",
                },
            },
        },
    },
    {
        name: "joni iskandar",
        absence: {
            july: {
                1: {
                    status: "a",
                    desc: "",
                },
                2: {
                    status: "i",
                    desc: "sedang dirumah sakit",
                },
            },
            august: {
                1: {
                    status: "h",
                    desc: "",
                },
                2: {
                    status: "a",
                    desc: "",
                },
            },
        },
    },
];

const absenceStatus = {
    h: "hadir",
    a: "absen",
    i: "izin",
};

function BoxDate({ date }: { date: number }) {
    const onChangeRadio = (e: RadioChangeEvent) => {};

    const content = (
        <div className="">
            <Radio.Group onChange={onChangeRadio} value={null}>
                <Space direction="vertical">
                    <Radio value="h">Hadir semua</Radio>
                    <Radio value="a">Libur / Dll</Radio>
                </Space>
            </Radio.Group>
        </div>
    );

    return (
        <Popover trigger={["click"]} content={content}>
            <div className="w-full flex items-center justify-center hover:opacity-25" title="Klik ">
                <p className="m-0 text-white cursor-pointer font-semibold">{date}</p>
            </div>
        </Popover>
    );
}

function BoxAbsence({ detail, date }: { detail?: DetailAbsence; date: number }) {
    const [absence, setAbsence] = useState<DetailAbsence | undefined>(detail);

    const onChangeRadio = (e: RadioChangeEvent) => {
        setAbsence((prev) => ({
            status: e.target.value,
            desc: prev?.desc || "",
        }));
    };

    const onChangeInput = (e: any) => {
        setAbsence((prev) => ({
            status: prev?.status as any,
            desc: e.target.value,
        }));
    };

    const className = clsx("cursor-pointer hover:opacity-70 flex items-center justify-center w-full h-6 bg-gray-200", {
        "bg-green-400": absence?.status === "h",
        "bg-red-400": absence?.status === "a",
        "bg-gray-400": absence?.status === "i",
    });

    const content = (
        <div className="">
            <Radio.Group onChange={onChangeRadio} value={absence?.status}>
                <Space direction="vertical">
                    <Radio value="h">Hadir</Radio>
                    <Radio value="a">Absen</Radio>
                    <Radio value="i">
                        Izin
                        {absence?.status === "i" ? <Input onChange={onChangeInput} style={{ width: 100, marginLeft: 10 }} /> : null}
                    </Radio>
                </Space>
            </Radio.Group>
        </div>
    );

    return (
        <Popover trigger={["click"]} content={content}>
            <Tooltip
                placement="bottomLeft"
                title={
                    <p className="m-0 capitalize">
                        Tanggal {date} {absence ? `: ${absenceStatus[absence?.status]}` : null}
                        <br />
                        {absence?.status === "i" ? absence?.desc : ""}
                    </p>
                }
            >
                <div className={className} />
            </Tooltip>
        </Popover>
    );
}

function AbsenceTable({ month }: { month: string }) {
    return (
        <div className="w-full flex flex-col">
            <div className="w-full bg-blue-400 p-3 flex items-stretch mb-3">
                <p className="font-semibold w-[150px] m-0 text-white">Nama</p>
                <div className="h-5 bg-white w-1px" />
                <div className="w-full flex justify-evenly">
                    {[...new Array(dateCount)]?.map((_, i) => (
                        <BoxDate date={i + 1} />
                    ))}
                </div>
                <div className="w-[70px] flex items-center gap-[5px] ml-[5px]">
                    {["H", "A", "I"]?.map((el) => (
                        <div className="m-0 w-full text-black font-semibold" title="Hadir">
                            {el}
                        </div>
                    ))}
                </div>
            </div>
            {absensi?.map((absence) => {
                const absenceThisMonth = absence.absence[month];
                const count = Object.keys(absenceThisMonth || {})?.reduce(
                    (prev, curr) => {
                        const status = absenceThisMonth[curr as any]?.status;
                        if (status === "h") {
                            return {
                                ...prev,
                                hadir: prev.hadir + 1,
                            };
                        }
                        if (status === "a") {
                            return {
                                ...prev,
                                absen: prev.absen + 1,
                            };
                        }
                        if (status === "i") {
                            return {
                                ...prev,
                                izin: prev.izin + 1,
                            };
                        }
                        return prev;
                    },
                    {
                        hadir: 0,
                        absen: 0,
                        izin: 0,
                    }
                );
                return (
                    <div className="w-full flex items-center px-3 py-1">
                        <p className="w-[150px] font-semibold m-0 text-black capitalize line-clamp-1">{absence.name}</p>
                        <div className="w-full flex justify-evenly gap-[1px]">
                            {[...new Array(dateCount)]?.map((_, i) => {
                                if (!absenceThisMonth || Object.keys(absenceThisMonth).length === 0) {
                                    return <BoxAbsence date={i + 1} />;
                                }
                                return <BoxAbsence detail={absenceThisMonth[i + 1]} date={i + 1} />;
                            })}
                        </div>
                        <div className="w-[70px] flex items-center gap-[5px] ml-[5px]">
                            {[count.hadir, count.absen, count.izin]?.map((el) => (
                                <div className="m-0 w-full text-black font-semibold" title="Hadir">
                                    {el}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function InfoSiswaAbsensiEdit() {
    const [currentMonth, setCurrentMonth] = useState<string>(moment(moment.now()).format("MMMM").toLowerCase());

    const items: TabsProps["items"] = MONTHS?.map((m) => ({
        key: m?.toLowerCase(),
        label: m?.CapitalizeEachFirstLetter(),
        children: <AbsenceTable month={m} />,
    }));

    const onChangeTab = (key: any) => {
        setCurrentMonth(key);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to={STAFF_PATH.infosiswa.absensisiswa.index}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Edit Absensi Siwa</h1>
                </Space>
            </div>
            <Card>
                <Descriptions title="Kelas XII IPA 1">
                    <Descriptions.Item label="Wali Kelas">Zhou Maomao</Descriptions.Item>
                </Descriptions>
            </Card>
            <div className="bg-white p-2">
                <p className="m-0 capitalize font-semibold">
                    TA 2022/2023 <br />
                    Kelas X
                </p>
                <Tabs activeKey={currentMonth?.toString()} items={items} onChange={onChangeTab} />
            </div>
        </div>
    );
}

export default InfoSiswaAbsensiEdit;
