import { Descriptions } from "antd";
import { FaRegEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { STUDENT_PATH } from "utils/constant";

function StudentProfile() {
    return (
        <div>
            <div className="w-full flex items-center justify-between">
                <h1>Profil</h1>
                <Link to={STUDENT_PATH.profile.edit}>
                    <FaRegEdit title="edit profil" className="cursor-pointer text-lg" />
                </Link>
            </div>
            <img src="https://source.unsplash.com/random/?Cryptocurrency&1" alt="" className="w-[200px] h-[200px] rounded-full object-cover" />
            <Descriptions title="User Info" className="mt-10">
                <Descriptions.Item label="Nama">Fiqri ardiansyah</Descriptions.Item>
                <Descriptions.Item label="NUPTK">1810000000</Descriptions.Item>
                <Descriptions.Item label="Email">fiqri@gmail.com</Descriptions.Item>
                <Descriptions.Item label="Handphone">0823423423</Descriptions.Item>
                <Descriptions.Item label="Kelamin">Laki - Laki</Descriptions.Item>
                <Descriptions.Item label="Tempat, Tanggal lahir">Medan, 12 Feb 2000</Descriptions.Item>
                <Descriptions.Item label="Alamat">No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China</Descriptions.Item>
                <Descriptions.Item label="Posisi">Staff kurikulum</Descriptions.Item>
            </Descriptions>
        </div>
    );
}

export default StudentProfile;
