import { Input } from "antd";
import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import TableSiswaAlumni from "modules/table-alumni";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";

const getAlumni = httpsCallable(functionInstance, "getAlumni");

function Alumni() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("query");

    const studentAlumniQuery = useQuery(["get-student", query], async () => {
        return (await getAlumni({ query })).data as Siswa[];
    });

    const onSearch = (qr: string) => {
        searchParams.set("query", qr);
        setSearchParams(searchParams);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Siswa Alumni</h1>
                <Input.Search
                    defaultValue={query as any}
                    name="search"
                    onSearch={onSearch}
                    placeholder="Nama / NIS / NISN"
                    enterButton
                    className="w-[400px]"
                    allowClear
                />
            </div>
            <TableSiswaAlumni fetcher={studentAlumniQuery} />
        </div>
    );
}

export default Alumni;
