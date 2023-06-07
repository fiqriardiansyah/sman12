import { Button } from "antd";
import Layout from "components/common/layout";
import TableGuru, { Guru } from "modules/dataguru/table";
import TableKelas, { Kelas } from "modules/datakelas/table";
import TableStaff, { Staff } from "modules/datastaff/table";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

function MasterDataStaff() {
    const staff: Staff[] = [
        {
            id: "12",
            nama: "XII IPA 1",
            hp: "02823452354",
            nuptk: "243524532455345",
        },
        {
            id: "23",
            nama: "XII IPA 2",
            hp: "02356456",
            nuptk: "3463563456345634",
        },
        {
            id: "353",
            nama: "XII IPA 3",
            hp: "056785685",
            nuptk: "46356435645646456",
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Staff</h1>
                <Link to={STAFF_PATH.masterdata.datastaff.add}>
                    <Button>Tambah</Button>
                </Link>
            </div>
            <TableStaff staff={staff} />
        </div>
    );
}

export default MasterDataStaff;
