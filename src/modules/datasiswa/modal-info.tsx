import { Alert, Image } from "antd";
import ModalTemplate, { HandlerProps } from "components/modal/template";
import ImportSiswaFileImg from "assets/images/siswaimport.png";
import { mandatoryHeader, optionHeader } from "./modal-import";

type Props = {
    children: (data: HandlerProps) => void;
};

function ModalInfoImport({ children }: Props) {
    return (
        <ModalTemplate title="Aturan Import File" handlerInComponent={children} footer={null}>
            {(ctrl) => (
                <div className="flex flex-col gap-5">
                    <Alert
                        type="warning"
                        message={
                            <div>
                                File berupa hasil MS Excel <br />
                                Berikut kolom yang harus tersedia yaitu: <span className="font-bold">{mandatoryHeader?.join(", ")}</span> <br />
                                Dan kolom optional: <span className="font-bold">{optionHeader?.join(", ")}</span>
                            </div>
                        }
                    />
                    <span>Contoh: </span>
                    <Image src={ImportSiswaFileImg} className="w-full" alt="Import Siswa" />
                </div>
            )}
        </ModalTemplate>
    );
}

export default ModalInfoImport;
