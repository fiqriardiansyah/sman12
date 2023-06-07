import { Button } from "antd";
import TablePengumuman, { Pengumuman } from "modules/pengumuman/table";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

function StaffPengumuman() {
    const pengumuman: Pengumuman[] = [
        {
            id: 1,
            title: "Merdeka",
            body: "bla bla bla",
            created_at: "12 may 2000",
        },
        {
            id: 2,
            title: "Hari guru",
            body: "asdfasdf asdf asdf",
            created_at: "14 juni 2000",
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Pengumuman</h1>
                <Link to={STAFF_PATH.pengumuman.add}>
                    <Button>Tambah</Button>
                </Link>
            </div>
            <TablePengumuman pengumuman={pengumuman} />
        </div>
    );
}

export default StaffPengumuman;
