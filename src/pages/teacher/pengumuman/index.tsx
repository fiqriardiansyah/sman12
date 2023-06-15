import { Input } from "antd";
import { httpsCallable } from "firebase/functions";
import { Pengumuman } from "modules/pengumuman/table";
import TablePengumumanGuru from "modules/pengumuman[guru]/table";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";

function TeacherPengumuman() {
    const getNews = httpsCallable(functionInstance, "getNews");
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("query");

    const newsQuery = useQuery(["get-news", query], async () => {
        return ((await getNews({ query })).data as Pengumuman[]).sort((a, b) => b.tanggal_dibuat - a.tanggal_dibuat);
    });

    const onSearch = (qr: string) => {
        searchParams.set("query", qr);
        setSearchParams(searchParams);
    };

    return (
        <div className="w-full">
            <div className="w-full flex items-center justify-between mb-10 pt-5">
                <h1 className="m-0">Pengumuman</h1>
                <Input.Search
                    defaultValue={query as any}
                    name="search"
                    onSearch={onSearch}
                    placeholder="Cari pengumuman"
                    enterButton
                    className="w-[400px]"
                    allowClear
                />
            </div>
            <TablePengumumanGuru fetcher={newsQuery} />
        </div>
    );
}

export default TeacherPengumuman;
