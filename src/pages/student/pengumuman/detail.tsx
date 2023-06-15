import { Alert, Skeleton, Space } from "antd";
import StateRender from "components/common/state";
import { httpsCallable } from "firebase/functions";
import { Pengumuman } from "modules/pengumuman/table";
import moment from "moment";
import ReactHtmlParser from "react-html-parser";
import { IoMdArrowBack } from "react-icons/io";
import { useQuery } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { FORMATE_DATE_TIME } from "utils/constant";

function StudentPengumumanDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const detailNews = httpsCallable(functionInstance, "detailNews");

    const newsQuery = useQuery(["get-news", id], async () => {
        return (await detailNews({ id })).data as Pengumuman;
    });

    const clickGoBack = (e: any) => {
        e.preventDefault();
        navigate(-1);
    };

    return (
        <div className="w-full">
            <Space className="mt-5 mb-10">
                <Link to=".." onClick={clickGoBack}>
                    <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                </Link>
                <h1 className="m-0">Pengumuman</h1>
            </Space>

            <StateRender data={newsQuery.data} isLoading={newsQuery.isLoading} isError={newsQuery.isError}>
                <StateRender.Data>
                    <div className="w-full flex items-start justify-between gap-10">
                        <p className="m-0 text-2xl capitalize font-medium">{newsQuery.data?.judul}</p>
                        <p className="m-0 text">
                            {newsQuery.data?.dibuat_oleh}. {moment(newsQuery.data?.tanggal_dibuat).format(FORMATE_DATE_TIME)}
                        </p>
                    </div>
                    <div className="mt-8">{ReactHtmlParser(newsQuery.data?.isi)}</div>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(newsQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default StudentPengumumanDetail;
