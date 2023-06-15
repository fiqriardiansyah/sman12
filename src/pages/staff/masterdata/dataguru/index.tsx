import { Button, Input, Space } from "antd";
import { httpsCallable } from "firebase/functions";
import TableGuru, { Guru } from "modules/dataguru/table";
import { useQuery } from "react-query";
import { Link, useSearchParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { STAFF_PATH } from "utils/constant";

function MasterDataGuru() {
    const getTeachers = httpsCallable(functionInstance, "getTeachers");

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("query");

    const teacherQuery = useQuery(["get-teacher", query], async () => {
        return (await getTeachers({ query })).data as Guru[];
    });

    const onSearch = (qr: string) => {
        searchParams.set("query", qr);
        setSearchParams(searchParams);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Guru</h1>
                <Space>
                    <Input.Search
                        defaultValue={query as any}
                        name="search"
                        onSearch={onSearch}
                        placeholder="Nama / NUPTK / Kelas"
                        enterButton
                        className="w-[400px]"
                        allowClear
                    />
                    <Link to={STAFF_PATH.masterdata.dataguru.add}>
                        <Button>Tambah</Button>
                    </Link>
                </Space>
            </div>
            <TableGuru fetcher={teacherQuery} />
        </div>
    );
}

export default MasterDataGuru;
