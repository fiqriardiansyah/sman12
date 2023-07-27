import { Button, Form, Input, message, notification } from "antd";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

function ForgotPassword() {
    const [loading, setLoading] = useState(false);

    const auth = getAuth();
    auth.useDeviceLanguage();

    const onFinish = (values: any) => {
        setLoading(true);
        sendPasswordResetEmail(auth, values.email)
            .then(() => {
                notification.info({
                    message: "Berhasil dikirim",
                    description: "Cek email anda untuk melanjutkan reset password",
                });
            })
            .catch((error: any) => {
                message.error(error?.message);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center">
            <h2>Reset password</h2>
            <Form onFinish={onFinish} requiredMark={false} className="w-[300px]">
                <Form.Item
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: "Please input your email!",
                        },
                    ]}
                >
                    <Input placeholder="Masukkan email" className="border-2 border-gray-500 border-solid placeholder:text-gray-500" />
                </Form.Item>
                <Form.Item>
                    <Button loading={loading} type="primary" htmlType="submit">
                        Kirim Reset Email
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default ForgotPassword;
