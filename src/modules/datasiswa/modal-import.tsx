import { Button, Table, message } from "antd";
import ModalTemplate, { HandlerProps } from "components/modal/template";
import { FileUploader } from "react-drag-drop-files";
import { useState } from "react";
import { BiImageAdd } from "react-icons/bi";
import { SiMicrosoftexcel } from "react-icons/si";
import readXlsxFile from "read-excel-file";
import { ColumnsType } from "antd/es/table";
import { Siswa } from "./table";

type Props = {
    children: (data: HandlerProps) => void;
    onSave: (rowSiswa: Partial<Siswa>[]) => void;
};

export const mandatoryHeader = ["nama", "nisn"];
export const optionHeader = ["nis", "hp", "alamat", "wali"];

function ModalImportSiswa({ children, onSave }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [rowSiswa, setRowSiswa] = useState<Partial<Siswa>[]>([]);

    const handleChange = (fl: File | null) => {
        readXlsxFile(fl as any).then((rows) => {
            const headers = rows[0]; // ["name", "nisn", ....];
            if (!headers || rows.length === 1) {
                message.error("Data tidak ditemukan");
                return;
            }
            const notFoundHeaders = mandatoryHeader.filter((el) => !headers.includes(el));
            if (notFoundHeaders.length) {
                message.error(`Data Kolom " ${notFoundHeaders.join(", ")} " tidak ditemukan`);
                return;
            }
            const transformData = rows?.splice(1)?.map((row) => {
                return headers.reduce(
                    (obj: any, curr: any, i: number) => ({
                        ...obj,
                        [curr]: row[i],
                    }),
                    {}
                );
            });
            setFile(fl);
            setRowSiswa(transformData);
        });
    };

    const onSizeError = (err: any) => message.error(err);

    const onTypeError = (err: any) => message.error(err);

    const columns: ColumnsType<any> = Object.keys(rowSiswa[0] || {})?.map((row) => ({
        title: row?.CapitalizeEachFirstLetter(),
        dataIndex: row?.toLowerCase(),
        render: (text) => <p className="m-0 capitalize">{text || "-"}</p>,
    }));

    const clearRow = () => {
        setRowSiswa([]);
        setFile(null);
    };

    return (
        <ModalTemplate width={800} title="Import Siswa" handlerInComponent={children} footer={null} afterClose={clearRow}>
            {(ctrl) => (
                <div className="flex flex-col gap-5">
                    <FileUploader types={["xlsx"]} multiple={false} onTypeError={onTypeError} onSizeError={onSizeError} handleChange={handleChange}>
                        {file ? (
                            <div className="flex items-center text-xl cursor-pointer my-4">
                                <SiMicrosoftexcel className="mr-2" />
                                {file.name}
                            </div>
                        ) : (
                            <div className="my-5 flex flex-col items-center cursor-pointer">
                                <BiImageAdd className="text-3xl" />
                                <p className="capitalize text-xs text-center mt-4">
                                    drop or click here <br />
                                </p>
                            </div>
                        )}
                    </FileUploader>
                    {rowSiswa.length ? (
                        <Table
                            size="small"
                            columns={columns}
                            dataSource={rowSiswa || []}
                            className="w-full"
                            pagination={{ showSizeChanger: false }}
                        />
                    ) : null}
                    {rowSiswa.length ? (
                        <Button
                            onClick={() => {
                                ctrl.closeModal();
                                onSave(rowSiswa);
                            }}
                            type="primary"
                            className="!w-fit"
                        >
                            Simpan
                        </Button>
                    ) : null}
                </div>
            )}
        </ModalTemplate>
    );
}

export default ModalImportSiswa;
