import configFirebase from "config/firebase";
import { User as UserFirebase, getAuth, onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import React, { createContext } from "react";
import { useMutation, useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import Utils from "utils";

interface User extends UserFirebase {
    role?: "teacher" | "staff" | "student";
}

interface State {
    user: User | null;
    loading: boolean;
}

interface ValueContextType {
    state?: State;
    setState?: React.Dispatch<React.SetStateAction<State>>;
}

const UserContext = createContext<ValueContextType>({});

function UserProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = React.useState<Partial<State> | null>({ loading: true });
    const getMyData = httpsCallable(functionInstance, "getUserWithEmail");

    const getMyDataMutate = useMutation(["profile", state?.user], async (email: any) => {
        const myData = (await (await getMyData({ email })).data) as any;
        setState((prev) => ({
            ...prev,
            user: {
                ...prev?.user,
                ...(myData || {}),
            },
            loading: false,
        }));
    });

    React.useEffect(() => {
        onAuthStateChanged(getAuth(configFirebase.app), async (usr) => {
            setState((prev) => ({
                ...prev,
                user: usr,
                loading: false,
            }));
            if (usr) {
                getMyDataMutate.mutate(usr?.email);
            }
        });
    }, []);

    const value = React.useMemo(() => ({ state, setState }), [state, setState]);

    return <UserContext.Provider value={value as any}>{children}</UserContext.Provider>;
}

export { UserContext, UserProvider };
