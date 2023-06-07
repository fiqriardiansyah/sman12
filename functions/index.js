const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { uuid } = require("uuidv4");

const GMAIL = "@gmail.com";

const app = admin.initializeApp();

// USER
exports.getUserWithEmail = functions.https.onCall(async (data) => {
    const users = await admin.firestore().collection("users").where("email", "==", data.email).get();
    const user = [];

    users?.forEach((usr) => {
        user.push({
            ...usr.data(),
            id: usr.id,
        });
    });

    if (!user.length) throw new functions.https.HttpsError("not-found", "data user not found");
    return user[0];
});

exports.getUserWithId = functions.https.onCall(async (data) => {
    const user = await admin.firestore().collection("users").doc(data.id).get();
    if (!user.exists) {
        throw new functions.https.HttpsError("not-found", "data user not found");
    }
    return {
        ...user.data(),
        id: user.id,
    };
});

exports.editUser = functions.https.onCall(async (data) => {
    const fullDataUser = await admin.firestore().collection("users").where("email", "==", data.email).get();
    const db = admin.firestore();
    try {
        fullDataUser?.forEach((user) => {
            const docRef = db.collection("users").doc(user.id);
            docRef.update(data);
        });
        return data;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.deleteUserWithEmail = functions.https.onCall(async (data) => {
    try {
        const db = admin.firestore().collection("users");
        const findUid = await db.where("email", "==", data.email).get();
        findUid.forEach(async (usr) => {
            db.doc(usr.id).delete();
            await admin.auth().deleteUser(usr.data().uid);
        });
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

// STUDENT
exports.getStudents = functions.https.onCall(async () => {
    const req = await admin.firestore().collection("users").where("role", "==", "student").get();
    const students = [];
    req?.forEach((student) => {
        students.push({
            ...student.data(),
            id: student.id,
        });
    });
    return students;
});

exports.createStudent = functions.https.onCall(async (data) => {
    const email = data.nisn + GMAIL;

    return admin
        .auth()
        .getUserByEmail(email)
        .then(() => {
            throw new functions.https.HttpsError("already-exists", "already-exists");
        })
        .catch(async (e) => {
            if (e?.message === "already-exists") {
                throw new functions.https.HttpsError("already-exists", `siswa dengan nisn ${data.nisn} sudah terdaftar`);
            }
            const userRecord = await admin.auth().createUser({
                email,
                password: data.nisn,
                displayName: data.nama,
            });
            const userData = await admin
                .firestore()
                .collection("users")
                .add({
                    ...data,
                    uid: userRecord.uid,
                    email,
                    role: "student",
                });
            return { success: true };
        });
});

exports.createStudents = functions.https.onCall(async (data) => {
    const tData = await data?.map((el) => ({
        uid: uuid()?.split("-").join(""),
        email: el.nisn + GMAIL,
        password: el.nisn,
        displayName: el.nama,
    }));
    if (!tData.length) {
        throw new functions.https.HttpsError("resource-exhausted", "please input data");
    }

    return admin
        .auth()
        .importUsers(tData)
        .then(async (result) => {
            const failedIndex = result.errors.map((el) => el.index);
            const collRef = admin.firestore().collection("users");

            data?.forEach(async (doc, i) => {
                if (failedIndex.includes(i)) return;
                collRef.add({ ...doc, role: "student", email: doc.nisn + GMAIL, uid: tData[i].uid });
            });

            const failedData = data?.filter((el, i) => failedIndex.includes(i));
            return { failed: failedData };
        })
        .catch((error) => {
            throw new functions.https.HttpsError("unknown", error?.message);
        });
});

// TEACHER
exports.getTeachers = functions.https.onCall(async () => {
    const req = await admin.firestore().collection("users").where("role", "==", "teacher").get();
    const teachers = [];
    req?.forEach((teacher) => {
        teachers.push({
            ...teacher.data(),
            id: teacher.id,
        });
    });
    return teachers;
});

exports.createTeacherClass = functions.https.onCall(async (data) => {
    const email = data.nuptk + GMAIL;

    return admin
        .auth()
        .getUserByEmail(email)
        .then(() => {
            throw new functions.https.HttpsError("already-exists", "already-exists");
        })
        .catch(async (e) => {
            if (e?.message === "already-exists") {
                throw new functions.https.HttpsError("already-exists", `guru dengan nuptk ${data.nisn} sudah terdaftar`);
            }
            const userRecord = await admin.auth().createUser({
                email,
                password: data.nuptk,
                displayName: data.nama,
            });
            const userData = await admin
                .firestore()
                .collection("users")
                .add({
                    ...data,
                    uid: userRecord.uid,
                    email,
                    role: "teacher",
                });
            return { success: true };
        });
});
