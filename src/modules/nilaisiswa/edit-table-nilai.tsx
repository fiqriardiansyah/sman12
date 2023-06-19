import { Card, message } from "antd";
import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import { useContext, useState } from "react";
import { TbPlaylistAdd } from "react-icons/tb";
import { UseQueryResult, useMutation, useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { CLASSES_SEMESTER } from "utils/constant";
import { UserContext } from "context/user";
import RaportTable, { Nilai } from "./table-nilai";

const setGrade = httpsCallable(functionInstance, "setGrade");
const getGrade = httpsCallable(functionInstance, "getGrade");

function EditTableNilai({ semester, fetcher }: { semester: number; fetcher: UseQueryResult<Siswa, unknown> }) {
    const { state } = useContext(UserContext);

    const [editRow, setEditRow] = useState<Nilai | null>(null);
    const [nilai, setNilai] = useState<Nilai[]>([]);

    const setGradeMutate = useMutation(["set-grade"], async (data: any) => {
        return (await setGrade(data)).data;
    });

    const getGradeQuery = useQuery(
        ["get-grade", semester, fetcher.data?.id],
        async () => {
            return (await getGrade({ student_id: fetcher.data?.id, semester })).data;
        },
        {
            refetchInterval: false,
            refetchOnWindowFocus: false,
            enabled: !!fetcher.data?.id,
            staleTime: undefined,
            onSuccess: (data: any) => {
                if (!data || data?.length === 0) return;
                const tNilai = Object.keys(data).map(
                    (key, i) =>
                        ({
                            mata_pelajaran: key,
                            catatan: data[key]?.catatan,
                            nilai: data[key]?.nilai,
                            id: data[key]?.id,
                            author_id: data[key]?.author_id,
                        } as Nilai)
                );
                setNilai(tNilai);
            },
        }
    );

    const tNilai = (grades: Nilai[], prevEdited?: Nilai | null) => {
        return grades?.reduce(
            (obj, item) =>
                Object.assign(obj, {
                    [item.mata_pelajaran as any]: { ...item, author_id: prevEdited?.id === item.id ? state?.user?.id : item.author_id },
                }),
            {}
        );
    };

    const onRemoveRow = (grade: Nilai) => {
        setNilai((prev) => {
            const curr = prev?.filter((p) => p.id !== grade.id);
            setGradeMutate.mutateAsync({
                student_id: fetcher.data?.id,
                semester,
                grades: tNilai(curr),
            });
            return curr;
        });
    };

    const onAddRow = () => {
        const newRow: Nilai = {
            id: new Date().getTime(),
            catatan: "",
            mata_pelajaran: "",
            nilai: "",
            author_id: state?.user?.id,
        };
        setNilai((prev) => [...prev, newRow]);
        setEditRow(newRow);
    };

    const onEdit = (grades: Nilai[], prevEdit?: Nilai | null) => {
        const itemSet = new Set(grades.map((n) => n.mata_pelajaran as any));
        if (itemSet.size < grades.length) {
            message.error("Mata pelajaran tidak boleh duplikat");
            setNilai((prev) => prev?.filter((el) => el.id !== prevEdit?.id));
            return;
        }

        setNilai(grades);
        setGradeMutate.mutateAsync({
            student_id: fetcher.data?.id,
            semester,
            grades: tNilai(grades, prevEdit),
        });
    };

    const onCancelRow = (nl: Nilai | null) => {
        setNilai((prev) => prev?.filter((n) => n.id !== nl?.id));
    };

    return (
        <Card>
            <div className="w-full flex items-center justify-between mb-4">
                <div className="flex flex-col">
                    <p className="m-0 capitalize text-xl">semester: {semester % 2 !== 0 ? 1 : 2}</p>
                    <span className="">Kelas {CLASSES_SEMESTER[semester - 1]}</span>
                </div>
                {!editRow ? <TbPlaylistAdd onClick={onAddRow} className="text-xl cursor-pointer" /> : null}
            </div>
            <RaportTable
                onCancel={onCancelRow}
                editRow={editRow}
                setEditRow={setEditRow}
                list={nilai}
                removeItemList={onRemoveRow}
                loading={getGradeQuery.isLoading}
                onSetList={onEdit}
            />
        </Card>
    );
}

export default EditTableNilai;
