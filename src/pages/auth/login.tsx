import { Button, Form, Input, message } from "antd";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LoginData } from "models";
import { useMutation } from "react-query";
import { authInstance } from "service/firebase-instance";
import logoSman12 from "assets/images/logosman12.png";

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
        <div className="w-full h-screen flex flex-col items-center justify-center">
            <div className="flex flex-col items-center">
                <img src={logoSman12} alt="SMAN 12" className="w-[150px] mx-auto" />
                <h1>SMA NEGERI 12 MEDAN</h1>
            </div>
            <Form name="basic" initialValues={{ remember: true }} onFinish={onFinish} requiredMark={false} className="w-[300px]">
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
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default Login;
