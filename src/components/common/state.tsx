import React from "react";

interface Props {
    children: any;
    data: any;
    isLoading: any;
    isError: any;
}

const StateRenderContext = React.createContext<Partial<Props>>({});
StateRenderContext.displayName = "StateRenderContext";

const useStateRender = () => {
    const context = React.useContext(StateRenderContext);
    return context;
};

function Loading({ children }: { children: any }) {
    const { isLoading } = useStateRender();
    if (isLoading) return children;
    return null;
}

function Error({ children }: { children: any }) {
    const { isError } = useStateRender();
    if (isError) return children;
    return null;
}

function Data({ children }: { children: any }) {
    const { data } = useStateRender();
    if (data) return children;
    return null;
}

function StateRender({ children, data, isLoading, isError }: Props) {
    const value = React.useMemo(() => ({ data, isLoading, isError }), [data, isLoading, isError]);
    return <StateRenderContext.Provider value={value}>{children}</StateRenderContext.Provider>;
}

StateRender.Loading = Loading;
StateRender.Error = Error;
StateRender.Data = Data;

export default StateRender;
