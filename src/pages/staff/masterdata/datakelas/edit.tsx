import { Alert, Button, Card, DatePicker, Form, InputNumber, Popconfirm, Select, Skeleton, Space, Tabs, TabsProps, message } from "antd";
import { ColumnsType } from "antd/es/table";
import StateRender from "components/common/state";
import TableTransfer from "components/common/table-transfer";
import dayjs from "dayjs";
import { httpsCallable } from "firebase/functions";
import { Guru } from "modules/dataguru/table";
import React, { useState } from "react";
import { Kelas } from "modules/datakelas/table";
import { Roster } from "modules/datakelas/table-pelajaran";
import { Siswa } from "modules/datasiswa/table";
import { IoMdArrowBack } from "react-icons/io";
import { useMutation, useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { CLASS_OPTION, DAYS } from "utils/constant";
import RosterEdit from "modules/datakelas/roster";

const columns: ColumnsType<Siswa> = [
    {
        title: "Nama",
        dataIndex: "nama",
        render: (text) => <p className="m-0 capitalize">{text}</p>,
    },
    {
        title: "Nis",
        dataIndex: "nis",
        render: (text) => <p className="m-0">{text}</p>,
    },
    {
        title: "Nisn",
        dataIndex: "nisn",
        render: (text) => <p className="m-0">{text}</p>,
    },
];

function MasterDataKelasEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const getStudents = httpsCallable(functionInstance, "getStudents");
    const getTeachers = httpsCallable(functionInstance, "getTeachers");
    const detailClass = httpsCallable(functionInstance, "detailClass");
    const editClass = httpsCallable(functionInstance, "editClass");
    const deleteClass = httpsCallable(functionInstance, "deleteClass");

    const [targetKeys, setTargetKeys] = useState<string[]>([]);
    const [rosters, setRosters] = useState<any>({});

    const deleteClassMutate = useMutation(["delete-class"], async (data: any) => {
        return (await deleteClass(data)).data;
    });

    const teacherAvailableQuery = useQuery(["get-teacher"], async () => {
        return (await getTeachers()).data as Guru[];
    });

    const editClassMutation = useMutation(["edit-class", id], async (data: any) => {
        return (await editClass(data)).data;
    });

    const detailClassQuery = useQuery(
        ["get-class", id],
        async () => {
            return (await detailClass({ id: id as any })).data as Kelas;
        },
        {
            onSuccess: (data) => {
                setTargetKeys(data?.murid?.map((el) => el.id as any) || []);
                const tRosters = Object.keys(data?.rosters || {})?.reduce((obj, key) => {
                    const roster = (data?.rosters as any)[key];
                    const list = Object.keys(roster)?.reduce((arr: any[], rosterKey: any) => {
                        const item = roster[rosterKey];
                        return [...arr, { ...item, jam: dayjs(item.jam, "HH:mm:ss") }];
                    }, []);
                    return {
                        ...obj,
                        [key]: list,
                    };
                }, {});
                setRosters(tRosters);
            },
            refetchInterval: false,
            refetchOnWindowFocus: false,
        }
    );

    const studentAvailableQuery = useQuery(
        ["get-student"],
        async () => {
            return ((await getStudents()).data as Siswa[])?.filter((student) => !student.kelas || targetKeys.includes(student.id as any));
        },
        {
            enabled: !!targetKeys.length,
            refetchInterval: false,
            refetchOnWindowFocus: false,
        }
    );

    const onSaveForm = (values: any) => {
        if (!targetKeys.length) {
            message.error("Pilih siswa terlebih dahulu");
            return;
        }
        try {
            DAYS.forEach((day) => {
                if (!rosters[day] || !rosters[day].length) {
                    throw new Error(`Roster hari ${day} belum diisi`);
                }
            });
        } catch (e: any) {
            message.error(e?.message);
            return;
        }

        const tRosters = DAYS.reduce((obj, day) => {
            const daysRoster = rosters[day] as Roster[];
            return {
                ...obj,
                [day]: daysRoster.map((rstr) => ({ ...rstr, jam: dayjs(rstr.jam).format("HH:mm:ss") })),
            };
        }, {});

        const data = {
            ...values,
            wali_nama: teacherAvailableQuery.data?.find((t) => t.id === values.wali)?.nama,
            murid: targetKeys,
            rosters: tRosters,
            id,
            stambuk: dayjs(values?.stambuk).format("YYYY"),
        };

        editClassMutation
            .mutateAsync(data)
            .then(() => {
                navigate(-1);
                message.success("Berhasil mengubah data");
            })
            .catch((e) => {
                message.error(e?.message);
            });
    };

    const onChange = (nextTargetKeys: string[]) => {
        setTargetKeys(nextTargetKeys);
    };

    const confirm = () => {
        if (deleteClassMutate.isLoading || detailClassQuery.isLoading) return;
        deleteClassMutate
            .mutateAsync({ id, wali_id: detailClassQuery.data?.wali_id })
            .then(() => {
                message.success("Data kelas dihapus");
                navigate(-1);
            })
            .catch((e: any) => {
                message.error(e?.message);
            });
    };

    const initialValues = {
        kelas: detailClassQuery.data?.kelas,
        nomor_kelas: detailClassQuery.data?.nomor_kelas,
        wali: detailClassQuery.data?.wali_id,
        stambuk: dayjs(detailClassQuery.data?.stambuk) || undefined,
    };

    const clickGoBack = (e: any) => {
        e.preventDefault();
        navigate(-1);
    };

    const onChangeRoster = ({ day, roster }: { day: string; roster: Roster[] }) => {
        setRosters((prev: any) => ({
            ...prev,
            [day]: roster,
        }));
    };

    const items: TabsProps["items"] = React.useMemo(() => {
        return DAYS.map((day) => ({
            key: day,
            label: day?.CapitalizeFirstLetter(),
            children: <RosterEdit day={day} onChange={onChangeRoster} rosters={rosters} />,
        }));
    }, [rosters]);

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to=".." onClick={clickGoBack}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Edit Kelas</h1>
                </Space>
                <Popconfirm title="Hapus" description="Hapus permanen kelas?" onConfirm={confirm} okText="Ya" cancelText="Tidak">
                    <Button loading={deleteClassMutate.isLoading} danger>
                        Delete
                    </Button>
                </Popconfirm>
            </div>
            <StateRender data={detailClassQuery.data} isLoading={detailClassQuery.isLoading} isError={detailClassQuery.isError}>
                <StateRender.Data>
                    <Form initialValues={initialValues} onFinish={onSaveForm} autoComplete="off" layout="vertical" requiredMark={false}>
                        <div className="grid w-full grid-cols-4 gap-x-5">
                            <Form.Item label="Tingkat Kelas" name="kelas" rules={[{ required: true, message: "Kelas harus diisi!" }]}>
                                <Select options={CLASS_OPTION} />
                            </Form.Item>

                            <Form.Item label="Nomor Kelas" name="nomor_kelas" rules={[{ required: true, message: "Nomor Kelas harus diisi!" }]}>
                                <InputNumber max={20} min={1} className="w-full" />
                            </Form.Item>

                            <Form.Item label="Stambuk" name="stambuk" rules={[{ required: true, message: "Stambuk harus diisi!" }]}>
                                <DatePicker picker="year" className="w-full" />
                            </Form.Item>

                            <Form.Item label="Wali Kelas" name="wali" rules={[{ required: true, message: "Wali kelas harus diisi!" }]}>
                                <Select
                                    options={teacherAvailableQuery.data
                                        ?.filter((t) => !t.kelas || t.id === detailClassQuery.data?.wali_id)
                                        ?.map((t) => ({ label: t.nama, value: t.id }))}
                                    loading={teacherAvailableQuery.isLoading}
                                />
                            </Form.Item>
                        </div>
                        <TableTransfer
                            titles={[studentAvailableQuery.isLoading ? "Mengambil data..." : "Seluruh Siswa SMAN 12", "Kelas"]}
                            rowKey={(s: any) => s.id}
                            dataSource={studentAvailableQuery.data as any}
                            targetKeys={targetKeys}
                            showSearch
                            onChange={onChange}
                            filterOption={(inputValue, item) =>
                                item?.nama?.toLowerCase().indexOf(inputValue?.toLowerCase()) !== -1 ||
                                item.nis?.toString().indexOf(inputValue) !== -1 ||
                                item.nisn?.toString().indexOf(inputValue) !== -1
                            }
                            leftColumns={columns}
                            rightColumns={columns}
                        />
                        <div className="">
                            <p className="mt-5">Roster</p>
                            <Card>
                                <Tabs items={items} />
                            </Card>
                        </div>
                        <Form.Item>
                            <Button loading={editClassMutation.isLoading} type="primary" htmlType="submit" className="mt-10">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(detailClassQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default MasterDataKelasEdit;
