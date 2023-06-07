import { Button, Form, Input, message } from "antd";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LoginData } from "models";
import { useMutation } from "react-query";
import { authInstance } from "service/firebase-instance";

function Login() {
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

    const onFinish = (values: LoginData) => {
        signInMutation.mutate(values);
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center">
            <Form name="basic" initialValues={{ remember: true }} onFinish={onFinish} autoComplete="off">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: "Please input your email!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: "Please input your password!",
                        },
                    ]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button loading={signInMutation.isLoading} type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default Login;
