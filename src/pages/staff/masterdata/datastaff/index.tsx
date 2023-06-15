import { Button, Input, Space } from "antd";
import Layout from "components/common/layout";
import { httpsCallable } from "firebase/functions";
import TableGuru, { Guru } from "modules/dataguru/table";
import TableKelas, { Kelas } from "modules/datakelas/table";
import TableStaff, { Staff } from "modules/datastaff/table";
import { useQuery } from "react-query";
import { Link, useSearchParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { STAFF_PATH } from "utils/constant";

function MasterDataStaff() {
    const getStaffs = httpsCallable(functionInstance, "getStaffs");

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("query");

    const staffQuery = useQuery(["get-staffs", query], async () => {
        return (await getStaffs({ query })).data as Staff[];
    });

    const onSearch = (qr: string) => {
        searchParams.set("query", qr);
        setSearchParams(searchParams);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Data Staff</h1>
                <Space>
                    <Input.Search
                        defaultValue={query as any}
                        name="search"
                        onSearch={onSearch}
                        placeholder="Nama / NUPTK"
                        enterButton
                        className="w-[400px]"
                        allowClear
                    />
                    <Link to={STAFF_PATH.masterdata.datastaff.add}>
                        <Button>Tambah</Button>
                    </Link>
                </Space>
            </div>
            <TableStaff fetcher={staffQuery} />
        </div>
    );
}

export default MasterDataStaff;
