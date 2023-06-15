import { Button, Input, Space } from "antd";
import { httpsCallable } from "firebase/functions";
import TablePelajaran from "modules/datapelajaran/table";
import { useQuery } from "react-query";
import { Link, useSearchParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { STAFF_PATH } from "utils/constant";
import { Pelajaran } from "./add";

function MasterDataPelajaran() {
    const getSubjects = httpsCallable(functionInstance, "getSubjects");

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("query");

    const subjectsQuery = useQuery(["get-subject", query], async () => {
        return (await getSubjects({ query })).data as Pelajaran[];
    });

    const onSearch = (qr: string) => {
        searchParams.set("query", qr);
        setSearchParams(searchParams);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Pelajaran</h1>
                <Space>
                    <Input.Search
                        defaultValue={query as any}
                        name="search"
                        onSearch={onSearch}
                        placeholder="Mata pelajaran / Guru"
                        enterButton
                        className="w-[400px]"
                        allowClear
                    />
                    <Link to={STAFF_PATH.masterdata.datapelajaran.add}>
                        <Button>Tambah</Button>
                    </Link>
                </Space>
            </div>
            <TablePelajaran fetcher={subjectsQuery} />
        </div>
    );
}

export default MasterDataPelajaran;
