import { Button, Form, Input, message } from "antd";
import ModalTemplate, { HandlerProps } from "components/modal/template";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LoginData } from "models";
import { authInstance } from "service/firebase-instance";
import { useMutation } from "react-query";

type Props = {
    children: (data: HandlerProps) => void;
    onSubmit: (data: any) => void;
};

function ModalReauthentication({ children, onSubmit }: Props) {
    const signInMutation = useMutation(
        ["login"],
        async (data: LoginData) => {
            return (await signInWithEmailAndPassword(authInstance, data.email, data.password)).user;
        },
        {
            onError: (err: any) => {
                message.error(err?.message);
            },
        }
    );

    const onFinish = (ctrl: HandlerProps) => {
        return (values: LoginData) => {
            signInMutation.mutateAsync(values).then(() => {
                onSubmit(ctrl.data);
                ctrl.closeModal();
            });
        };
    };

    return (
        <ModalTemplate title="Autentikasi akun" handlerInComponent={children} footer={null}>
            {(ctrl) => (
                <div className="flex">
                    <Form onFinish={onFinish(ctrl)} requiredMark={false} className="w-full">
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your email!",
                                },
                            ]}
                        >
                            <Input placeholder="Email" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your password!",
                                },
                            ]}
                        >
                            <Input.Password placeholder="Password" />
                        </Form.Item>
                        <Form.Item>
                            <Button loading={signInMutation.isLoading} type="primary" htmlType="submit">
                                Autentikasi
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </ModalTemplate>
    );
}

export default ModalReauthentication;
