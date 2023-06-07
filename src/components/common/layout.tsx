import { Layout as LayoutAntd, LayoutProps } from "antd";
import React from "react";
import Sidebar from "./sidebar";

function Layout({ children, className, ...props }: LayoutProps) {
    const [collapsed, setCollapsed] = React.useState(false);

    return (
        <LayoutAntd className={`w-full flex min-h-screen bg-white ${className}`} {...props}>
            <LayoutAntd.Sider
                className="!overflow-auto !h-screen !fixed !left-0 !top-0 !bottom-0 bg-white"
                theme="light"
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                width={230}
            >
                <Sidebar />
            </LayoutAntd.Sider>
            <LayoutAntd style={{ marginLeft: collapsed ? 80 : 230, transition: "all .4s" }} className="w-screen bg-white">
                <LayoutAntd.Content>
                    <div className="h-full w-full bg-gray-100 container mx-auto px-6">{children}</div>
                </LayoutAntd.Content>
            </LayoutAntd>
        </LayoutAntd>
    );
}

export default Layout;
