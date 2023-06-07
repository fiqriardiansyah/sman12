import { Button } from "antd";
import Layout from "components/common/layout";
import TableKelas, { Kelas } from "modules/datakelas/table";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

function MasterDataKelas() {
    const kelas: Kelas[] = [
        {
            id: "12",
            nama: "XII IPA 1",
            wali: "ahmad dani",
        },
        {
            id: "23",
            nama: "XII IPA 2",
            wali: "mulan jamila",
        },
        {
            id: "353",
            nama: "XII IPA 3",
            wali: "al gazali",
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Kelas</h1>
                <Link to={STAFF_PATH.masterdata.datakelas.add}>
                    <Button>Tambah</Button>
                </Link>
            </div>
            <TableKelas kelas={kelas} />
        </div>
    );
}

export default MasterDataKelas;
