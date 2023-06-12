import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import TableNilaiSiswa from "modules/nilaisiswa/table";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";

function InfoSiswaNilai() {
    const getStudents = httpsCallable(functionInstance, "getStudents");

    const studentQuery = useQuery(["get-student"], async () => {
        return (await getStudents()).data as Siswa[];
    });

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Nilai Siswa</h1>
            </div>
            <TableNilaiSiswa fetcher={studentQuery} />
        </div>
    );
}

export default InfoSiswaNilai;
