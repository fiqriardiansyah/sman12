import { Button } from "antd";
import Layout from "components/common/layout";
import { httpsCallable } from "firebase/functions";
import TableSiswa, { Siswa } from "modules/datasiswa/table";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { STAFF_PATH } from "utils/constant";

function MasterDataSiswa() {
    const getStudents = httpsCallable(functionInstance, "getStudents");

    const studentQuery = useQuery(["get-student"], async () => {
        return (await getStudents()).data as Siswa[];
    });

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Siswa</h1>
                <Link to={STAFF_PATH.masterdata.datasiswa.add}>
                    <Button>Tambah</Button>
                </Link>
            </div>
            <TableSiswa fetcher={studentQuery} />
        </div>
    );
}

export default MasterDataSiswa;
