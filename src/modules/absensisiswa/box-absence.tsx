import { Button, Form, Input, Popover, Radio, RadioChangeEvent, Space, Tooltip, message } from "antd";
import clsx from "clsx";
import { DetailAttendance } from "pages/staff/infosiswa/absensisiswa/edit";
import React, { useEffect } from "react";
import { ABSEN_STATUS } from "utils/constant";

type Props = { detail?: DetailAttendance; date: number; onChange?: (data: any) => void; canInteract?: boolean };

function BoxAbsence({ detail, date, onChange, canInteract = true }: Props) {
    const [absence, setAbsence] = React.useState<DetailAttendance | undefined>(detail);

    useEffect(() => {
        setAbsence(detail);
    }, [detail]);

    const onChangeRadio = (e: RadioChangeEvent) => {
        setAbsence((prev) => {
            const curr = {
                status: e.target.value,
                desc: prev?.desc || "",
            };
            if (onChange) onChange({ detail: curr, date });
            return curr;
        });
    };

    const onFinishDesc = (value: any) => {
        message.success("Keterangan izin disimpan");
        setAbsence((prev) => {
            const curr = {
                status: prev?.status as any,
                desc: value?.desc,
            };
            if (onChange) onChange({ detail: curr, date });
            return curr;
        });
    };

    const className = clsx("hover:opacity-70 flex items-center justify-center w-full h-6 bg-gray-200", {
        "bg-green-400": absence?.status === "h",
        "bg-red-400": absence?.status === "a",
        "bg-gray-400": absence?.status === "i",
        "bg-yellow-200": absence?.status === "l",
        "bg-white": absence?.status === "x",
        "bg-pink-200": absence?.status === "s",
        "cursor-pointer": absence?.status !== "x",
    });

    const content = (
        <div className="">
            <Radio.Group onChange={onChangeRadio} value={absence?.status}>
                <Space direction="vertical">
                    <Radio value="h">Hadir</Radio>
                    <Radio value="a">Absen</Radio>
                    <Radio value="s">Sakit</Radio>
                    <Radio value="i" className="flex flex-row !items-start">
                        <div className={`flex flex-row gap-4 ${absence?.status === "i" ? "mt-6" : ""}`}>
                            Izin
                            {absence?.status === "i" ? (
                                <Form
                                    initialValues={{ desc: absence?.desc }}
                                    onFinish={onFinishDesc}
                                    layout="horizontal"
                                    className="flex flex-row gap-4"
                                >
                                    <Form.Item name="desc">
                                        <Input style={{ width: 300 }} />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit">
                                            Simpan
                                        </Button>
                                    </Form.Item>
                                </Form>
                            ) : null}
                        </div>
                    </Radio>
                </Space>
            </Radio.Group>
        </div>
    );

    if (absence?.status === "x") {
        return <div className="h-6 w-full" />;
    }

    if (!canInteract) {
        return (
            <Tooltip
                placement="bottomLeft"
                title={
                    <p className="m-0 capitalize">
                        Tanggal {date} {absence ? `: ${ABSEN_STATUS[absence?.status]}` : null}
                        <br />
                        {absence?.status === "i" ? absence?.desc : ""}
                    </p>
                }
            >
                <div className={`${className} !cursor-default`} />
            </Tooltip>
        );
    }

    return (
        <Popover trigger={["click"]} content={content}>
            <Tooltip
                placement="bottomLeft"
                title={
                    <p className="m-0 capitalize">
                        Tanggal {date} {absence ? `: ${ABSEN_STATUS[absence?.status]}` : null}
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

export default BoxAbsence;
