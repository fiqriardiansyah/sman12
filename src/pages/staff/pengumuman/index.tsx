import { Button, Input, Space } from "antd";
import { httpsCallable } from "firebase/functions";
import TablePengumuman, { Pengumuman } from "modules/pengumuman/table";
import { useQuery } from "react-query";
import { Link, useSearchParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { STAFF_PATH } from "utils/constant";

function StaffPengumuman() {
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
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Pengumuman</h1>
                <Space>
                    <Input.Search
                        defaultValue={query as any}
                        name="search"
                        onSearch={onSearch}
                        placeholder="Cari pengumuman"
                        enterButton
                        className="w-[400px]"
                        allowClear
                    />
                    <Link to={STAFF_PATH.pengumuman.add}>
                        <Button>Tambah</Button>
                    </Link>
                </Space>
            </div>
            <TablePengumuman fetcher={newsQuery} />
        </div>
    );
}

export default StaffPengumuman;
