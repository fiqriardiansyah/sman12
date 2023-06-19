import React from "react";
import { TbPlaylistAdd } from "react-icons/tb";
import { message } from "antd";
import dayjs from "dayjs";
import TableRoster, { Roster } from "./table-pelajaran";

type Props = {
    day: string;
    rosters?: any;
    onChange: ({ day, roster }: { day: string; roster: Roster[] }) => void;
};

function RosterEdit({ day, onChange, rosters }: Props) {
    const [editRow, setEditRow] = React.useState<Roster | null>(null);
    const [roster, setRoster] = React.useState<Roster[]>(rosters ? rosters[day] : []);

    React.useEffect(() => {
        setRoster(rosters ? rosters[day] : []);
    }, [rosters]);

    const onRemoveRow = (grade: Roster) => {
        setRoster((prev) => {
            const curr = prev?.filter((p) => p.id !== grade.id);
            onChange({ day, roster: curr });
            return curr;
        });
    };

    const onAddRow = () => {
        const newRow: Roster = {
            id: new Date().getTime(),
            mata_pelajaran: "",
            jam: "",
        };
        setRoster((prev) => {
            const curr = [...prev, newRow];
            return curr;
        });
        setEditRow(newRow);
    };

    const onEdit = (rs: Roster[], prevEditRow?: Roster | null) => {
        const subjectSet = new Set([...rs]?.map((n) => n.mata_pelajaran as any));
        const hourSet = new Set([...rs]?.map((n) => dayjs(n.jam).format("HH:mm") as any));

        if (subjectSet.size < rs.length) {
            message.error("Mata pelajaran tidak boleh duplikat");
            setRoster((prev) => prev?.filter((el) => el.id !== prevEditRow?.id));
            return;
        }

        if (hourSet.size < rs.length) {
            message.error("Jam pelajaran bentrok");
            setRoster((prev) => prev?.filter((el) => el.id !== prevEditRow?.id));
            return;
        }

        setRoster(rs);
        onChange({ day, roster: rs });
    };

    const onCancelRow = (rs: Roster | null) => {
        setRoster((prev) => prev?.filter((n) => n.id !== rs?.id));
    };

    return (
        <div className="flex flex-col">
            {!editRow ? <TbPlaylistAdd onClick={onAddRow} className="text-xl cursor-pointer self-end" title="Tambah pelajaran" /> : null}
            <TableRoster
                onCancel={onCancelRow}
                editRow={editRow}
                setEditRow={setEditRow}
                list={roster?.sort((a, b) => dayjs(a.jam).unix() - dayjs(b.jam).unix())}
                removeItemList={onRemoveRow}
                onSetList={onEdit}
            />
        </div>
    );
}

export default RosterEdit;
