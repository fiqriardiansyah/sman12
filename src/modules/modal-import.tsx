import { Alert, Button, Table, message } from "antd";
import ModalTemplate, { HandlerProps } from "components/modal/template";
import { FileUploader } from "react-drag-drop-files";
import { useState } from "react";
import { BiImageAdd } from "react-icons/bi";
import { SiMicrosoftexcel } from "react-icons/si";
import readXlsxFile from "read-excel-file";
import { ColumnsType } from "antd/es/table";
import { Guru } from "modules/dataguru/table";
import { Siswa } from "./datasiswa/table";

type Props = {
    children: (data: HandlerProps) => void;
    onSave: (rowData: Partial<Siswa | Guru>[]) => void;
    mandatoryHeader?: string[];
};

function ModalImport({ children, onSave, mandatoryHeader }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [rowData, setRowData] = useState<Partial<Siswa | Guru>[]>([]);

    const handleChange = (fl: File | null) => {
        readXlsxFile(fl as any).then((rows) => {
            const headers = rows[0]; // ["nama", "nisn", ....];
            if (!headers || rows.length === 1) {
                message.error("Data tidak ditemukan");
                return;
            }
            const notFoundHeaders = mandatoryHeader?.filter((el) => !headers?.map((h) => h?.toString()?.toLowerCase()).includes(el));
            if (notFoundHeaders?.length) {
                message.error(
                    `Data Kolom " ${notFoundHeaders?.map((el) => el?.toString()?.CapitalizeEachFirstLetter()).join(", ")} " tidak ditemukan`
                );
                return;
            }

            const validRow = rows?.splice(1);

            const emptyColumn = validRow
                ?.map((row) => {
                    const empty = mandatoryHeader?.filter((_, i) => !row[i]);
                    if (empty?.length) return row;
                    return null;
                })
                .filter(Boolean);

            if (emptyColumn?.length) {
                message.error("Mohon periksa kembali, data wajib tidak boleh kosong");
                return;
            }

            const transformData = validRow?.map((row) => {
                return headers.reduce(
                    (obj: any, curr: any, i: number) => ({
                        ...obj,
                        [curr]: row[i],
                    }),
                    {}
                );
            });
            setFile(fl);
            setRowData(transformData);
        });
    };

    const onSizeError = (err: any) => message.error(err);

    const onTypeError = (err: any) => message.error(err);

    const columns: ColumnsType<any> = Object.keys(rowData[0] || {})?.map((row) => ({
        title: row?.CapitalizeEachFirstLetter(),
        dataIndex: row,
        render: (text) => <p className="m-0 capitalize">{text}</p>,
    }));

    const clearRow = () => {
        setRowData([]);
        setFile(null);
    };

    return (
        <ModalTemplate width={800} title="Import Data" handlerInComponent={children} footer={null} afterClose={clearRow}>
            {(ctrl) => (
                <div className="flex flex-col gap-5">
                    <Alert showIcon message="Penting" type="error" description="Harap mengunduh file excel hasil import data!" />
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
                    {rowData.length ? (
                        <Table size="small" columns={columns} dataSource={rowData || []} className="w-full" pagination={{ showSizeChanger: false }} />
                    ) : null}
                    {rowData.length ? (
                        <Button
                            onClick={() => {
                                ctrl.closeModal();
                                onSave(rowData);
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

export default ModalImport;
