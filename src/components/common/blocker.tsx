/* eslint-disable react/jsx-no-useless-fragment */
import { Result } from "antd";
import React from "react";

type Props = {
    children: React.ReactNode;
    isBlock?: boolean;
    text?: string;
};

function Blocker({ children, isBlock, text = "" }: Props) {
    if (!isBlock) return <>{children}</>;
    return (
        <div className="relative">
            <div className="w-full h-full absolute top-0 left-0 z-40 flex items-center justify-center">
                <Result status="info" title={text} />
            </div>
            <div className="w-full h-full blur-sm">{children}</div>
        </div>
    );
}

export default Blocker;
