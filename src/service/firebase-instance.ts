import configFirebase from "config/firebase";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

export const functionInstance = getFunctions(configFirebase.app);
export const authInstance = getAuth(configFirebase.app);
export const firestoreInstance = getFirestore(configFirebase.app);
export const storageInstance = getStorage(configFirebase.app);

if (process.env.NODE_ENV === "development") {
    connectFunctionsEmulator(functionInstance, "localhost", 5001);
    connectAuthEmulator(authInstance, "http://localhost:4001/");
    connectFirestoreEmulator(firestoreInstance, "localhost", 4002);
    connectStorageEmulator(storageInstance, "localhost", 4004);
}

export default {};
