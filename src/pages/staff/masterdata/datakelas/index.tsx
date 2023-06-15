import { Button, Input, Space } from "antd";
import Layout from "components/common/layout";
import { httpsCallable } from "firebase/functions";
import TableKelas, { Kelas } from "modules/datakelas/table";
import { useQuery } from "react-query";
import { Link, useSearchParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { STAFF_PATH } from "utils/constant";

function MasterDataKelas() {
    const getTeachers = httpsCallable(functionInstance, "getClasses");

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("query");

    const classQuery = useQuery(["get-classes", query], async () => {
        return (await getTeachers({ query })).data as Kelas[];
    });

    const onSearch = (qr: string) => {
        searchParams.set("query", qr);
        setSearchParams(searchParams);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Kelas</h1>
                <Space>
                    <Input.Search
                        defaultValue={query as any}
                        name="search"
                        onSearch={onSearch}
                        placeholder="kelas / wali kelas"
                        enterButton
                        className="w-[400px]"
                        allowClear
                    />
                    <Link to={STAFF_PATH.masterdata.datakelas.add}>
                        <Button>Tambah</Button>
                    </Link>
                </Space>
            </div>
            <TableKelas fetcher={classQuery} />
        </div>
    );
}

export default MasterDataKelas;
