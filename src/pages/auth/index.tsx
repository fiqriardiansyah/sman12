import { Outlet } from "react-router-dom";

function Auth() {
    return (
        <div className="w-full h-full">
            <Outlet />
        </div>
    );
}

export default Auth;
