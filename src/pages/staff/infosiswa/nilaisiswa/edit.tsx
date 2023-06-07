import { Button, Card, Descriptions, Space } from "antd";
import EditTableNilai from "modules/nilaisiswa/edit-table-nilai";
import { IoMdArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { STAFF_PATH } from "utils/constant";

function InfoSiswaNilaiEdit() {
    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to={STAFF_PATH.infosiswa.nilaisiswa.index}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Edit Nilai Siwa</h1>
                </Space>
                <Button>Semester Baru</Button>
            </div>
            <Card>
                <Descriptions title="Detail Siswa">
                    <Descriptions.Item label="Nama">Zhou Maomao</Descriptions.Item>
                    <Descriptions.Item label="NIS">1810000000</Descriptions.Item>
                    <Descriptions.Item label="NISN">234563456345</Descriptions.Item>
                    <Descriptions.Item label="Kelas">XII IPA 1</Descriptions.Item>
                    <Descriptions.Item label="Alamat">No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China</Descriptions.Item>
                </Descriptions>
            </Card>
            <EditTableNilai semester={3} />
        </div>
    );
}

export default InfoSiswaNilaiEdit;
