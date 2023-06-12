import { Button } from "antd";
import { httpsCallable } from "firebase/functions";
import TablePengumuman, { Pengumuman } from "modules/pengumuman/table";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { STAFF_PATH } from "utils/constant";

function StaffPengumuman() {
    const getNews = httpsCallable(functionInstance, "getNews");

    const newsQuery = useQuery(["get-news"], async () => {
        return (await getNews()).data as Pengumuman[];
    });

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Pengumuman</h1>
                <Link to={STAFF_PATH.pengumuman.add}>
                    <Button>Tambah</Button>
                </Link>
            </div>
            <TablePengumuman fetcher={newsQuery} />
        </div>
    );
}

export default StaffPengumuman;
