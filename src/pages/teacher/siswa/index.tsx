import { Input, Select, Space } from "antd";
import { httpsCallable } from "firebase/functions";
import TableDaftarSiswa from "modules/daftarsiswa/table";
import { Kelas } from "modules/datakelas/table";
import { Siswa } from "modules/datasiswa/table";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";

const getStudents = httpsCallable(functionInstance, "getStudents");
const getClasses = httpsCallable(functionInstance, "getClasses");

function TeacherDaftarSiswa() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("query");
    const kelas = searchParams.get("class");

    const classQuery = useQuery(["get-class"], async () => {
        return ((await getClasses()).data as Kelas[])?.map((el) => ({ label: el.nama_kelas, value: el.nama_kelas }));
    });

    const studentQuery = useQuery(["get-student", query, kelas], async () => {
        return (await getStudents({ query, kelas })).data as Siswa[];
    });

    const onSearch = (qr: string) => {
        searchParams.set("query", qr);
        setSearchParams(searchParams);
    };

    const onSelect = (kls: string) => {
        searchParams.set("class", kls || "");
        setSearchParams(searchParams);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Siswa</h1>
                <Space>
                    <Select
                        defaultValue={kelas}
                        onChange={onSelect}
                        options={[...(classQuery.data || []), { label: "Tidak ada kelas", value: "no_class" }]}
                        loading={classQuery.isLoading}
                        placeholder="Kelas"
                        allowClear
                        className="!w-[150px]"
                    />
                    <Input.Search
                        defaultValue={query as any}
                        name="search"
                        onSearch={onSearch}
                        placeholder="Nama / NIS / NISN"
                        enterButton
                        className="w-[400px]"
                        allowClear
                    />
                </Space>
            </div>
            <TableDaftarSiswa fetcher={studentQuery} />
        </div>
    );
}

export default TeacherDaftarSiswa;
