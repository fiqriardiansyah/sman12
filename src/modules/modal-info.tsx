import { Alert, Image } from "antd";
import ModalTemplate, { HandlerProps } from "components/modal/template";

type Props = {
    mandatoryHeader?: string[];
    optionHeader?: string[];
    imageImport?: any;
    children: (data: HandlerProps) => void;
};

function ModalInfoImport({ children, mandatoryHeader, optionHeader, imageImport }: Props) {
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
                    <Image src={imageImport} className="w-full" alt="Import" />
                </div>
            )}
        </ModalTemplate>
    );
}

export default ModalInfoImport;
