import { useEffect, useState } from "react";
import { Card } from "antd";
import { TbPlaylistAdd } from "react-icons/tb";
import { httpsCallable } from "firebase/functions";
import { functionInstance } from "service/firebase-instance";
import { UseQueryResult, useMutation, useQuery } from "react-query";
import { Siswa } from "modules/datasiswa/table";
import { CLASSES_SEMESTER } from "utils/constant";
import RaportTable, { Nilai } from "./table-nilai";

const setGrade = httpsCallable(functionInstance, "setGrade");
const getGrade = httpsCallable(functionInstance, "getGrade");

function EditTableNilai({ semester, fetcher }: { semester: number; fetcher: UseQueryResult<Siswa, unknown> }) {
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
            enabled: !!fetcher.data?.id,
            staleTime: undefined,
            onSuccess: (data: any) => {
                if (!data || data?.length === 0) return;
                const tNilai = Object.keys(data).map(
                    (key, i) => ({ mata_pelajaran: key, catatan: data[key]?.catatan, nilai: data[key]?.nilai, id: i } as Nilai)
                );
                setNilai(tNilai);
            },
        }
    );

    const tNilai = (grades: Nilai[]) => {
        return grades?.reduce(
            (obj, item) => Object.assign(obj, { [item.mata_pelajaran?.toLowerCase() as any]: { nilai: item.nilai, catatan: item.catatan } }),
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
        };
        setNilai((prev) => {
            const curr = [...prev, newRow];
            setGradeMutate.mutateAsync({
                student_id: fetcher.data?.id,
                semester,
                grades: tNilai(curr),
            });
            return curr;
        });
        setEditRow(newRow);
    };

    const onEdit = (grades: Nilai[]) => {
        setGradeMutate.mutateAsync({
            student_id: fetcher.data?.id,
            semester,
            grades: tNilai(grades),
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
                setList={setNilai}
                removeItemList={onRemoveRow}
                loading={getGradeQuery.isLoading}
                onSetList={onEdit}
            />
        </Card>
    );
}

export default EditTableNilai;
