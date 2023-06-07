import { Button } from "antd";
import { httpsCallable } from "firebase/functions";
import TableGuru, { Guru } from "modules/dataguru/table";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { STAFF_PATH } from "utils/constant";

function MasterDataGuru() {
    const getTeachers = httpsCallable(functionInstance, "getTeachers");

    const teacherQuery = useQuery(["get-teacher"], async () => {
        return (await getTeachers()).data as Guru[];
    });

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Guru</h1>
                <Link to={STAFF_PATH.masterdata.dataguru.add}>
                    <Button>Tambah</Button>
                </Link>
            </div>
            <TableGuru fetcher={teacherQuery} />
        </div>
    );
}

export default MasterDataGuru;
