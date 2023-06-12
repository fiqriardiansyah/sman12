import { httpsCallable } from "firebase/functions";
import TableAbsensiKelas from "modules/absensisiswa/table";
import { Kelas } from "modules/datakelas/table";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";

function InfoSiswaAbsensi() {
    const getTeachers = httpsCallable(functionInstance, "getClasses");

    const classQuery = useQuery(["get-classes"], async () => {
        return (await getTeachers()).data as Kelas[];
    });

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Absensi Siswa</h1>
            </div>
            <TableAbsensiKelas fetcher={classQuery} />
        </div>
    );
}

export default InfoSiswaAbsensi;
