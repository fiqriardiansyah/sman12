import { Button } from "antd";
import Layout from "components/common/layout";
import { httpsCallable } from "firebase/functions";
import TableKelas, { Kelas } from "modules/datakelas/table";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { STAFF_PATH } from "utils/constant";

function MasterDataKelas() {
    const getTeachers = httpsCallable(functionInstance, "getClasses");

    const classQuery = useQuery(["get-classes"], async () => {
        return (await getTeachers()).data as Kelas[];
    });

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Kelas</h1>
                <Link to={STAFF_PATH.masterdata.datakelas.add}>
                    <Button>Tambah</Button>
                </Link>
            </div>
            <TableKelas fetcher={classQuery} />
        </div>
    );
}

export default MasterDataKelas;
