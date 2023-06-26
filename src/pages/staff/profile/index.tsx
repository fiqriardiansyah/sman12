import { Alert, Descriptions, Image, Skeleton } from "antd";
import StateRender from "components/common/state";
import { UserContext } from "context/user";
import { httpsCallable } from "firebase/functions";
import { Staff } from "modules/datastaff/table";
import { useContext } from "react";
import { FaRegEdit } from "react-icons/fa";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { functionInstance } from "service/firebase-instance";
import { GENDER, IMAGE_FALLBACK, JENJANG, KEPEGAWAIAN, STAFF_PATH } from "utils/constant";

function Profile() {
    const { state } = useContext(UserContext);
    const getMyData = httpsCallable(functionInstance, "getUserWithEmail");

    const profileQuery = useQuery(["profile", state?.user?.uid], async () => {
        return (await (
            await getMyData({ email: state?.user?.email })
        ).data) as Staff;
    });

    return (
        <div>
            <div className="w-full flex items-center justify-between">
                <h1>Profil</h1>
                <Link to={STAFF_PATH.profile.edit}>
                    <FaRegEdit title="edit profil" className="cursor-pointer text-lg" />
                </Link>
            </div>
            <StateRender data={profileQuery.data} isLoading={profileQuery.isLoading} isError={profileQuery.isError}>
                <StateRender.Data>
                    <Image
                        height={200}
                        width={200}
                        src={profileQuery.data?.foto}
                        className="!rounded-full object-cover"
                        fallback={IMAGE_FALLBACK}
                        alt={profileQuery.data?.nama}
                    />
                    <Descriptions title="User Info" className="mt-10" bordered>
                        <Descriptions.Item label="Nama">{profileQuery.data?.nama}</Descriptions.Item>
                        <Descriptions.Item label="NUPTK">{profileQuery.data?.nuptk}</Descriptions.Item>
                        <Descriptions.Item label="Email">{profileQuery.data?.email}</Descriptions.Item>
                        <Descriptions.Item label="Handphone">{profileQuery.data?.hp}</Descriptions.Item>
                        <Descriptions.Item label="Jenis Kelamin">
                            {GENDER.find((el) => el.value === profileQuery?.data?.kelamin)?.label}
                        </Descriptions.Item>
                        <Descriptions.Item label="Alamat">{profileQuery.data?.alamat}</Descriptions.Item>
                        <Descriptions.Item label="Posisi">{profileQuery.data?.posisi}</Descriptions.Item>
                        <Descriptions.Item label="Tgl lahir">{profileQuery.data?.tgl_lahir}</Descriptions.Item>
                        <Descriptions.Item label="Tempat lahir">{profileQuery.data?.tempat_lahir}</Descriptions.Item>
                        <Descriptions.Item label="Status kepegawaian">
                            {KEPEGAWAIAN.find((el) => el.value === profileQuery.data?.status_kepegawaian)?.label || ""}
                        </Descriptions.Item>
                        <Descriptions.Item label="Jurusan">{profileQuery.data?.jurusan}</Descriptions.Item>
                        <Descriptions.Item label="Jenjang">{JENJANG.find((el) => el.value === profileQuery.data?.jenjang)?.label}</Descriptions.Item>
                    </Descriptions>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(profileQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default Profile;
