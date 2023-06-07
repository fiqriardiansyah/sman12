import { useState } from "react";
import { Card } from "antd";
import { TbPlaylistAdd } from "react-icons/tb";
import RaportTable, { Nilai } from "./table-nilai";

function EditTableNilai({ semester }: { semester: number }) {
    const [editRow, setEditRow] = useState<Nilai | null>(null);
    const [nilai, setNilai] = useState<Nilai[]>([]);

    const onRemoveProduct = (product: Nilai) => {
        setNilai((prev) => prev?.filter((p) => p.id !== product.id));
    };

    const onAddRow = () => {
        const newRow: Nilai = {
            id: new Date().getTime(),
            catatan: "",
            mata_pelajaran: "",
            nilai: "",
        };
        setNilai((prev) => [...prev, newRow]);
        setEditRow(newRow);
    };

    const onCancelRow = (nl: Nilai | null) => {
        setNilai((prev) => prev?.filter((n) => n.id !== nl?.id));
    };

    const classes = ["X", "X", "XI", "XI", "XII", "XII"];

    return (
        <Card>
            <div className="w-full flex items-center justify-between mb-4">
                <div className="flex flex-col">
                    <p className="m-0 capitalize text-xl">semester: {semester % 2 !== 0 ? 1 : 2}</p>
                    <span className="">Kelas {classes[semester - 1]}</span>
                </div>
                {!editRow ? <TbPlaylistAdd onClick={onAddRow} className="text-xl cursor-pointer" /> : null}
            </div>
            <RaportTable
                onCancel={onCancelRow}
                editRow={editRow}
                setEditRow={setEditRow}
                list={nilai}
                setList={setNilai}
                removeItemList={onRemoveProduct}
            />
        </Card>
    );
}

export default EditTableNilai;
