import { Button, DatePicker, Form, Input, Select, Space, message } from "antd";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { FaFileImport } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import dayjs from "dayjs";
import { httpsCallable } from "firebase/functions";
import ModalImportSiswa from "modules/datasiswa/modal-import";
import ModalInfoImport from "modules/datasiswa/modal-info";
import { Siswa } from "modules/datasiswa/table";
import { IoMdArrowBack } from "react-icons/io";
import { useMutation } from "react-query";
import { functionInstance } from "service/firebase-instance";
import { FORMAT_DATE_DAYJS, GENDER, STAFF_PATH } from "utils/constant";

function MasterDataSiswaAdd() {
    const navigate = useNavigate();
    const createStudent = httpsCallable(functionInstance, "createStudent");
    const createStudents = httpsCallable(functionInstance, "createStudents");

    const createStudentsMutate = useMutation(
        ["create-students"],
        async (data: Partial<Siswa>[]) => {
            return (await createStudents(data)).data;
        },
        {
            onSuccess() {
                navigate(-1);
                message.success("Berhasil menambahkan semua data");
            },
            onError(error: any) {
                message.error(error?.message);
            },
        }
    );

    const createStudentMutate = useMutation(
        ["create-student"],
        async (data: Partial<Siswa>) => {
            return (await createStudent({ ...data })).data;
        },
        {
            onSuccess(data) {
                navigate(-1);
                message.success("Berhasil menambahkan data");
            },
            onError(error: any) {
                message.error(error?.message);
            },
        }
    );

    const onSaveSiswa = (values: Siswa) => {
        createStudentMutate.mutate({
            ...values,
            tgl_lahir: values?.tgl_lahir ? dayjs(values?.tgl_lahir).format(FORMAT_DATE_DAYJS) : "",
        });
    };

    const importSiswa = (siswa: Partial<Siswa>[]) => {
        createStudentsMutate.mutate(siswa);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <Space>
                    <Link to={STAFF_PATH.masterdata.datasiswa.index}>
                        <IoMdArrowBack className="text-lg m-0 mt-1 cursor-pointer" />
                    </Link>
                    <h1 className="m-0">Tambah Siswa</h1>
                </Space>
                <Space>
                    <ModalInfoImport>
                        {(ctrl) => <AiOutlineQuestionCircle title="Aturan Import File" onClick={ctrl.openModal} className="text-xl cursor-pointer" />}
                    </ModalInfoImport>
                    <ModalImportSiswa onSave={importSiswa}>
                        {(ctrl) => (
                            <Button
                                disabled={createStudentMutate.isLoading || createStudentsMutate.isLoading}
                                loading={createStudentsMutate.isLoading}
                                className="!flex !items-center"
                                onClick={ctrl.openModal}
                            >
                                <FaFileImport className="mr-3" />
                                Import
                            </Button>
                        )}
                    </ModalImportSiswa>
                </Space>
            </div>
            <Form
                disabled={createStudentMutate.isLoading || createStudentsMutate.isLoading}
                onFinish={onSaveSiswa}
                autoComplete="off"
                layout="vertical"
                requiredMark={false}
            >
                <div className="grid w-full grid-cols-3 gap-x-5">
                    <Form.Item label="Nama" name="nama" rules={[{ required: true, message: "Nama harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="NISN" name="nisn" rules={[{ required: true, message: "NISN harus diisi!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="NIS" name="nis">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Jenis Kelamin" name="kelamin">
                        <Select options={GENDER} />
                    </Form.Item>

                    <Form.Item label="Alamat" name="alamat">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Telepon" name="hp">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Wali / Orang tua" name="wali">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Telepon Wali/Orang tua" name="hp_wali">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Tanggal Lahir" name="tgl_lahir">
                        <DatePicker className="w-full" />
                    </Form.Item>

                    <Form.Item label="Tempat Lahir" name="tempat_lahir">
                        <Input />
                    </Form.Item>
                </div>
                <Form.Item>
                    <Button loading={createStudentMutate.isLoading} type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default MasterDataSiswaAdd;
