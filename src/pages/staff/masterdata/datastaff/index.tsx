import { Button } from "antd";
import Layout from "components/common/layout";
import { httpsCallable } from "firebase/functions";
import TableGuru, { Guru } from "modules/dataguru/table";
import TableKelas, { Kelas } from "modules/datakelas/table";
import TableStaff, { Staff } from "modules/datastaff/table";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { STAFF_PATH } from "utils/constant";

function MasterDataStaff() {
    const getStaffs = httpsCallable(functionInstance, "getStaffs");

    const staffQuery = useQuery(["get-staffs"], async () => {
        return (await getStaffs()).data as Staff[];
    });

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Staff</h1>
                <Link to={STAFF_PATH.masterdata.datastaff.add}>
                    <Button>Tambah</Button>
                </Link>
            </div>
            <TableStaff fetcher={staffQuery} />
        </div>
    );
}

export default MasterDataStaff;
