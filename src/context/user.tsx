import { message } from "antd";
import configFirebase from "config/firebase";
import { User as UserFirebase, getAuth, onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import React, { createContext } from "react";
import { useMutation } from "react-query";
import { functionInstance } from "service/firebase-instance";

interface User extends UserFirebase {
    role?: "teacher" | "staff" | "student" | "admin";
    nama?: string;
    id?: string;
    kelas?: string;
    kelas_id?: string;
    lulus?: string;
}

interface State {
    user: User | null;
    loading: boolean;
    loadingGetData?: boolean;
}

interface ValueContextType {
    state?: State;
    setState?: React.Dispatch<React.SetStateAction<State>>;
}

const UserContext = createContext<ValueContextType>({});

function UserProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = React.useState<Partial<State> | null>({ loading: true, loadingGetData: true });
    const getMyData = httpsCallable(functionInstance, "getUserWithEmail");

    const getMyDataMutate = useMutation(["profile", state?.user], async (email: any) => {
        const myData = (await (await getMyData({ email })).data) as any;
        setState((prev) => ({
            ...prev,
            user: {
                ...prev?.user,
                ...(myData || {}),
            },
            loadingGetData: false,
        }));
    });

    React.useEffect(() => {
        onAuthStateChanged(getAuth(configFirebase.app), async (usr) => {
            if (usr) {
                getMyDataMutate.mutate(usr?.email);
            }
            setState((prev) => ({
                ...prev,
                user: usr,
                loading: false,
                loadingGetData: !!usr,
            }));
        });
    }, []);

    const value = React.useMemo(() => ({ state, setState }), [state, setState]);

    return <UserContext.Provider value={value as any}>{children}</UserContext.Provider>;
}

export { UserContext, UserProvider };
