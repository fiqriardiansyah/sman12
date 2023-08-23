import { Alert, Button, Popconfirm, Select, Skeleton, Tag, message } from "antd";
import Blocker from "components/common/blocker";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import { Guru } from "modules/dataguru/table";
import { Kelas } from "modules/datakelas/table";
import { useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { useMutation, useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { JOURNEY_CLASSES } from "utils/constant";

const getTeachers = httpsCallable(functionInstance, "getTeachers");
const getClasses = httpsCallable(functionInstance, "getClasses");
const newAcademicYear = httpsCallable(functionInstance, "newAcademicYear");
const getLatestAcademicYearUpdate = httpsCallable(functionInstance, "getLatestAcademicYearUpdate");

interface ChangedKelas extends Kelas {
    wali_id_baru?: any;
    wali_nama_baru?: any;
    kelas_baru?: any;
}

function PergantianTahunAjar() {
    const [dataChanges, setDataChanges] = useState<ChangedKelas[]>([]);

    const newAcademicYearMutate = useMutation(
        ["newAcademicYear"],
        async (classes: ChangedKelas[]) => {
            return (await newAcademicYear({ list: classes })).data;
        },
        {
            onError(e: any) {
                message.error(e?.message);
            },
        }
    );

    const teacherQuery = useQuery(["get-teacher"], async () => {
        return (await getTeachers()).data as Guru[];
    });

    const getLatestAcademicYearUpdateQuery = useQuery(["get-latest-academic-year"], async () => {
        return (await getLatestAcademicYearUpdate()).data;
    });

    const classQuery = useQuery(
        ["get-classes"],
        async () => {
            return (await getClasses()).data as Kelas[];
        },
        {
            onSuccess(data) {
                const sortData = data?.sort((a, b) => {
                    if (a.kelas! < b.kelas!) return -1;
                    if (a.kelas! > b.kelas!) return 1;
                    return 0;
                });
                setDataChanges(sortData || []);
            },
            refetchInterval: false,
            refetchOnWindowFocus: false,
        }
    );

    const isBlockUpdateNewYear = getLatestAcademicYearUpdateQuery.data
        ? Number(getLatestAcademicYearUpdateQuery.data) === new Date().getFullYear()
        : false;

    const calculateNextClass = (kelas: any) => {
        const getIndex = JOURNEY_CLASSES.indexOf(kelas);
        return JOURNEY_CLASSES[getIndex + 1];
    };

    const onChangeWali = (kelas: Kelas) => {
        return (teacherId: string) => {
            const alreadyPick = dataChanges.find((cls) => cls.wali_id_baru === teacherId);
            if (alreadyPick) {
                message.error("Guru wali sudah dipilih sebelumnya");
                return;
            }
            const teacherName = teacherQuery.data?.find((t) => t.id === teacherId)?.nama;
            setDataChanges((prev) =>
                prev?.map((cls) => (cls.id === kelas.id ? { ...cls, wali_id_baru: teacherId, wali_nama_baru: teacherName } : cls))
            );
        };
    };

    const waliComplete =
        dataChanges?.reduce((a, b) => a + (b.wali_id_baru ? 1 : 0), 0) ===
            (dataChanges?.length || 0) - dataChanges.reduce((a, b) => a + (calculateNextClass(b.kelas) === "LULUS" ? 1 : 0), 0) || 0;

    const confirm = () => {
        if (isBlockUpdateNewYear) return;
        const tData = dataChanges?.map((prev) => ({ ...prev, kelas_baru: calculateNextClass(prev.kelas) }));
        newAcademicYearMutate.mutateAsync(tData).then(() => {
            message.success("Sukses");
            getLatestAcademicYearUpdateQuery.refetch();
        });
    };

    return (
        <Blocker isBlock={isBlockUpdateNewYear} text="Kenaikan kelas sudah dilakukan, sampai jumpa ditahun depan 👋">
            <div className="flex flex-col gap-5 pb-10">
                <div className="w-full flex items-center justify-between mt-5 mb-1s0">
                    <h1 className="m-0">Kenaikan kelas</h1>
                    {dataChanges?.length ? (
                        <Popconfirm
                            title="Kenaikan kelas"
                            description="Mulai proses?"
                            onConfirm={confirm}
                            okText="Ya"
                            cancelText="Tidak"
                            disabled={!waliComplete || newAcademicYearMutate.isLoading}
                        >
                            <Button danger disabled={!waliComplete || newAcademicYearMutate.isLoading} loading={newAcademicYearMutate.isLoading}>
                                Proses
                            </Button>
                        </Popconfirm>
                    ) : null}
                </div>
                <StateRender
                    data={classQuery.data}
                    isLoading={classQuery.isLoading || getLatestAcademicYearUpdateQuery.isLoading}
                    isError={classQuery.isError}
                >
                    <StateRender.Data>
                        {!dataChanges?.length ? (
                            <Alert message="Tidak ada kelas yang terdaftar" type="error" />
                        ) : (
                            <div className="w-full flex items-center justify-between">
                                <Tag color="default">Sebelum</Tag>
                                <Tag color="success">Sesudah</Tag>
                            </div>
                        )}

                        {dataChanges?.map((kelas, i) => {
                            return (
                                <div key={kelas.id} className="w-full flex items-center justify-between py-2 px-3 bg-white">
                                    <div className="flex flex-col flex-1">
                                        <p className="m-0 font-semibold text-xl mb-2">{kelas.nama_kelas}</p>
                                        <span className="capitalize">Wali: {kelas.wali_nama}</span>
                                        <span>
                                            Stambuk: {kelas.stambuk} / {Number(kelas.stambuk) + 1}
                                        </span>
                                    </div>
                                    <AiOutlineArrowRight className="text-3xl font-bold text-green-400 flex-1" />
                                    {calculateNextClass(kelas.kelas) === "LULUS" ? (
                                        <h1 className="text-green-400 text-2xl font-semibold flex-1">LULUS</h1>
                                    ) : (
                                        <div className="flex-1">
                                            <p className="m-0 font-semibold text-xl">{calculateNextClass(kelas.kelas) + kelas.nomor_kelas}</p>
                                            <div>
                                                Wali:{" "}
                                                <Select
                                                    value={kelas?.wali_id_baru || null}
                                                    onChange={onChangeWali(kelas)}
                                                    showSearch
                                                    options={teacherQuery.data?.map((t) => ({ label: t.nama, value: t.id }))}
                                                    loading={teacherQuery.isLoading}
                                                    className="!w-[200px]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </StateRender.Data>
                    <StateRender.Loading>
                        <Skeleton />
                    </StateRender.Loading>
                    <StateRender.Error>
                        <Alert type="error" message={(classQuery.error as any)?.message} />
                    </StateRender.Error>
                </StateRender>
            </div>
        </Blocker>
    );
}

export default PergantianTahunAjar;
