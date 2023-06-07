import React from "react";
import ReactDOM from "react-dom/client";
import { UserProvider } from "context/user";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./app";
import "./style/index.css";
import "utils/extension";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <QueryClientProvider client={queryClient}>
        <ConfigProvider>
            <React.StrictMode>
                <UserProvider>
                    <App />
                </UserProvider>
            </React.StrictMode>
        </ConfigProvider>
    </QueryClientProvider>
);
