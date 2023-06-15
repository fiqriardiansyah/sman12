import { Input } from "antd";
import { httpsCallable } from "firebase/functions";
import TableAbsensiKelas from "modules/absensisiswa/table";
import { Kelas } from "modules/datakelas/table";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";

function InfoSiswaAbsensi() {
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
                <h1 className="m-0">Absensi Siswa</h1>
                <Input.Search
                    defaultValue={query as any}
                    name="search"
                    onSearch={onSearch}
                    placeholder="kelas / wali kelas"
                    enterButton
                    className="w-[400px]"
                    allowClear
                />
            </div>
            <TableAbsensiKelas fetcher={classQuery} />
        </div>
    );
}

export default InfoSiswaAbsensi;
