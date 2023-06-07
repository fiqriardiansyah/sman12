import { Modal, ModalProps } from "antd";
import { useEffect, useState } from "react";

export type HandlerProps = {
    data: any;
    isModalOpen: boolean;
    openModal: () => void;
    openModalWithData: (data: any) => void;
    closeModal: () => void;
};

export type PropsModalTemplate = Omit<ModalProps, "children"> & {
    children: (data: HandlerProps) => void;
    handler?: (data: HandlerProps) => void;
    handlerInComponent?: (data: HandlerProps) => void;
    handlerDataChange?: (data: any) => void;
};

function ModalTemplate({ children, handler, handlerInComponent, handlerDataChange, ...props }: PropsModalTemplate) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (handlerDataChange) {
            handlerDataChange(data);
        }
    }, [data]);

    const closeModal = () => {
        setIsModalOpen(false);
        setData(null);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const openModalWithData = (dt: any) => {
        setData(dt);
        openModal();
    };

    const childrenData: HandlerProps = {
        data,
        isModalOpen,
        openModal,
        closeModal,
        openModalWithData,
    };

    if (handler) {
        handler(childrenData);
    }

    return (
        <>
            <Modal open={isModalOpen} onCancel={closeModal} {...props}>
                <>{children(childrenData)}</>
            </Modal>
            {handlerInComponent && handlerInComponent(childrenData)}
        </>
    );
}

export default ModalTemplate;
