import { Input, Select, Space } from "antd";
import { httpsCallable } from "firebase/functions";
import { Pengumuman } from "modules/pengumuman/table";
import TablePengumumanSiswa from "modules/pengumuman[siswa]/table";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { CATEGORY_NEWS } from "utils/constant";

function StudentPengumuman() {
    const getNews = httpsCallable(functionInstance, "getNews");
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("query");
    const category = searchParams.get("category");

    const newsQuery = useQuery(["get-news", query, category], async () => {
        return ((await getNews({ query, category })).data as Pengumuman[]).sort((a, b) => b.tanggal_dibuat - a.tanggal_dibuat);
    });

    const onSearch = (qr: string) => {
        searchParams.set("query", qr);
        setSearchParams(searchParams);
    };

    const onSelect = (ctg: string) => {
        searchParams.set("category", ctg || "");
        setSearchParams(searchParams);
    };

    return (
        <div className="w-full">
            <div className="w-full flex items-center justify-between mb-10 pt-5">
                <h1 className="m-0">Pengumuman</h1>
                <Space>
                    <Select
                        defaultValue={category}
                        onChange={onSelect}
                        options={CATEGORY_NEWS}
                        placeholder="Kategori"
                        allowClear
                        className="!w-[150px]"
                    />
                    <Input.Search
                        defaultValue={query as any}
                        name="search"
                        onSearch={onSearch}
                        placeholder="Cari pengumuman"
                        enterButton
                        className="w-[400px]"
                        allowClear
                    />
                </Space>
            </div>
            <TablePengumumanSiswa fetcher={newsQuery} />
        </div>
    );
}

export default StudentPengumuman;
