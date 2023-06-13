import { httpsCallable } from "firebase/functions";
import { Pengumuman } from "modules/pengumuman/table";
import TablePengumumanSiswa from "modules/pengumuman[siswa]/table";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";

function StudentPengumuman() {
    const getNews = httpsCallable(functionInstance, "getNews");

    const newsQuery = useQuery(["get-news"], async () => {
        return (await getNews()).data as Pengumuman[];
    });

    return (
        <div className="w-full">
            <h1 className="m-0 mb-10 pt-4">Pengumuman</h1>
            <TablePengumumanSiswa fetcher={newsQuery} />
        </div>
    );
}

export default StudentPengumuman;
