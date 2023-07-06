import { Button, Form, Input } from "antd";
import ModalTemplate, { HandlerProps } from "components/modal/template";

type Props = {
    children: (data: HandlerProps) => void;
    onSubmit: (val: { reason: string }) => void;
};

function ModalRejectSpp({ children, onSubmit }: Props) {
    return (
        <ModalTemplate title="Alasan ditolak" handlerInComponent={children} footer={null}>
            {(ctrl) => (
                <div className="flex">
                    <Form
                        onFinish={(val: { reason: string }) => {
                            ctrl.closeModal();
                            onSubmit(val);
                        }}
                        className="w-full"
                    >
                        <Form.Item name="reason" rules={[{ required: true, message: "Alasan wajib diisi" }]}>
                            <Input.TextArea className="w-full !h-[200px]" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </ModalTemplate>
    );
}

export default ModalRejectSpp;
