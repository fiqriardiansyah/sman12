const functions = require("firebase-functions");
const admin = require("firebase-admin");

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
exports.getStudents = functions.https.onCall(async (data) => {
    const req = await admin.firestore().collection("users").where("role", "==", "student").get();
    const students = [];
    req?.forEach((student) => {
        students.push({
            ...student.data(),
            id: student.id,
        });
    });

    if (data?.query || data?.kelas) {
        return students
            ?.filter((student) => {
                if (!data?.query) return student;
                return (
                    student?.nama?.toLowerCase()?.includes(data?.query?.toLowerCase()) ||
                    student?.nisn?.toString()?.includes(data?.query) ||
                    student?.nis?.toString()?.includes(data?.query)
                );
            })
            .filter((student) => {
                if (!data?.kelas) return student;
                if (data?.kelas === "no_class") return !student?.kelas;
                return student?.kelas === data.kelas;
            });
    }

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
    const prepareDate = data?.map((user) => ({
        email: user.nisn + GMAIL,
        password: `${user.nisn}sman12`,
        displayName: user.nama,
    }));

    if (!prepareDate.length) {
        throw new functions.https.HttpsError("resource-exhausted", "please input data");
    }

    try {
        const createUsers = prepareDate?.map((user) => admin.auth().createUser(user));
        const usersAccount = await Promise.all(createUsers).then((result) => result.map((usr) => usr));

        const usersCollRef = admin.firestore().collection("users");

        usersAccount?.forEach((user) => {
            const dataUser = data.find((dt) => dt.nisn + GMAIL === user.email);
            usersCollRef.add({ ...dataUser, role: "student", email: dataUser.nisn + GMAIL, uid: user.uid });
        });
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

// TEACHER
exports.getTeachers = functions.https.onCall(async (data) => {
    const req = await admin.firestore().collection("users").where("role", "==", "teacher").get();
    const teachers = [];
    req?.forEach((teacher) => {
        teachers.push({
            ...teacher.data(),
            id: teacher.id,
        });
    });

    if (data?.query) {
        return teachers?.filter(
            (teacher) =>
                teacher?.nama?.toLowerCase()?.includes(data?.query?.toLowerCase()) ||
                teacher?.nuptk?.toString()?.includes(data?.query) ||
                teacher?.kelas?.toLowerCase()?.includes(data?.query)
        );
    }

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
                throw new functions.https.HttpsError("already-exists", `guru dengan nuptk ${data.nuptk} sudah terdaftar`);
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

// SUBJECT
exports.createSubject = functions.https.onCall(async (data) => {
    const db = admin.firestore().collection("subjects");
    try {
        await db.add(data);
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.editSubject = functions.https.onCall(async (data) => {
    const db = admin.firestore().collection("subjects").doc(data.id);
    try {
        await db.update(data.update);
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getSubjects = functions.https.onCall(async (data) => {
    try {
        const db = await admin.firestore().collection("subjects").get();
        const subjects = [];
        db.forEach((subject) => {
            subjects.push({
                ...subject.data(),
                id: subject.id,
            });
        });

        if (data?.query) {
            return subjects?.filter(
                (sbj) => sbj?.mata_pelajaran?.toLowerCase()?.includes(data?.query?.toLowerCase()) || sbj?.guru_nama?.toString()?.includes(data?.query)
            );
        }

        return subjects;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.detailSubject = functions.https.onCall(async (data) => {
    try {
        const db = await admin.firestore().collection("subjects").doc(data.id).get();
        if (!db.exists) {
            throw new functions.https.HttpsError("not-found", "mata pelajaran tidak ditemukan");
        }
        const subject = {
            ...db.data(),
            id: db.id,
        };
        return subject;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
    //
});

// STAFF
exports.getStaffs = functions.https.onCall(async (data) => {
    const req = await admin.firestore().collection("users").where("role", "==", "staff").get();
    const staffs = [];
    req?.forEach((staff) => {
        staffs.push({
            ...staff.data(),
            id: staff.id,
        });
    });

    if (data?.query) {
        return staffs?.filter(
            (staff) => staff?.nama?.toLowerCase()?.includes(data?.query?.toLowerCase()) || staff?.nuptk?.toString()?.includes(data?.query)
        );
    }

    return staffs;
});

exports.createStaff = functions.https.onCall(async (data) => {
    const email = data.nuptk + GMAIL;

    return admin
        .auth()
        .getUserByEmail(email)
        .then(() => {
            throw new functions.https.HttpsError("already-exists", "already-exists");
        })
        .catch(async (e) => {
            if (e?.message === "already-exists") {
                throw new functions.https.HttpsError("already-exists", `staff dengan nuptk ${data.nuptk} sudah terdaftar`);
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
                    role: "staff",
                });
            return { success: true };
        });
});

// CLASS
exports.getClasses = functions.https.onCall(async (data) => {
    const collClassRef = admin.firestore().collection("classes");
    const getClass = await collClassRef.get();

    const classes = [];
    getClass?.forEach((cls) => {
        classes.push({
            ...cls.data(),
            id: cls.id,
        });
    });

    if (data?.query) {
        return classes?.filter(
            (cls) => cls?.kelas?.toLowerCase()?.includes(data?.query?.toLowerCase()) || cls?.wali_nama?.toString()?.includes(data?.query)
        );
    }

    return classes;
});

exports.createClass = functions.https.onCall(async (data) => {
    const isClassExist = await admin
        .firestore()
        .collection("classes")
        .where("kelas", "==", data.kelas)
        .where("nomor_kelas", "==", data.nomor_kelas)
        .get();
    if (!isClassExist.empty) {
        throw new functions.https.HttpsError("already-exists", `kelas "${data.kelas}${data.nomor_kelas}" sudah ada`);
    }

    const classCollRef = admin.firestore().collection("classes");
    const userCollRef = admin.firestore().collection("users");
    const db = admin.database();

    try {
        const createdClass = await classCollRef.add({
            wali_id: data.wali,
            wali_nama: data.wali_nama,
            kelas: data.kelas,
            nomor_kelas: data.nomor_kelas,
            nama_kelas: data.kelas + data.nomor_kelas,
        });

        const querieStudents = [];
        data?.murid?.forEach((id) => {
            const query = userCollRef.doc(id);
            querieStudents.push(query);
        });

        const students = await Promise.all(querieStudents.map((q) => q.get())).then((docs) => {
            return docs.map((doc) => ({ id: doc.id, uid: doc.data().uid }));
        });

        const studentClassCollRef = classCollRef.doc(createdClass.id).collection("students");

        students.forEach((student) => {
            studentClassCollRef.add(student);
            userCollRef.doc(student.id).update({ kelas_id: createdClass.id, kelas: data.kelas + data.nomor_kelas });
        });

        const createRoster = await db.ref(`rosters/${createdClass.id}`).set(data.rosters);

        const addClassToTeacher = await userCollRef.doc(data.wali).update({ kelas_id: createdClass.id, kelas: data.kelas + data.nomor_kelas });

        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.detailClass = functions.https.onCall(async (data) => {
    const docRef = admin.firestore().collection("classes").doc(data.id);
    const userColRef = admin.firestore().collection("users");

    try {
        const dataClass = await docRef.get();
        if (!dataClass.exists) {
            return null;
        }

        const studentClass = await docRef.collection("students").get();

        const queriesStudents = [];
        studentClass?.forEach((doc) => {
            const query = userColRef.doc(doc.data().id);
            queriesStudents.push(query);
        });

        const dataStudents = await Promise.all(queriesStudents.map((q) => q.get())).then((result) => {
            return result?.map((doc) => ({ ...doc.data(), id: doc.id }));
        });

        return {
            ...dataClass.data(),
            murid: dataStudents || [],
        };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.editClass = functions.https.onCall(async (data) => {
    const isClassExist = await admin
        .firestore()
        .collection("classes")
        .where("kelas", "==", data.kelas)
        .where("nomor_kelas", "==", data.nomor_kelas)
        .get();

    let isThisClass = false;
    isClassExist.forEach((doc) => {
        if (doc.id === data.id_kelas) {
            isThisClass = true;
        }
    });

    if (!isClassExist.empty && !isThisClass) {
        throw new functions.https.HttpsError("already-exists", `kelas "${data.kelas}${data.nomor_kelas}" sudah ada`);
    }

    const classCollRef = admin.firestore().collection("classes");
    const userCollRef = admin.firestore().collection("users");

    try {
        // const createdClass = await classCollRef.add({
        //     wali_id: data.wali,
        //     wali_nama: data.wali_nama,
        //     kelas: data.kelas,
        //     nomor_kelas: data.nomor_kelas,
        // });
        // const querieStudents = [];
        // data?.murid?.forEach((id) => {
        //     const query = userCollRef.doc(id);
        //     querieStudents.push(query);
        // });
        // const students = await Promise.all(querieStudents.map((q) => q.get())).then((docs) => {
        //     return docs.map((doc) => ({ id: doc.id, uid: doc.data().uid }));
        // });
        // const studentClassCollRef = classCollRef.doc(createdClass.id).collection("students");
        // students.forEach((student) => {
        //     studentClassCollRef.add(student);
        //     userCollRef.doc(student.id).update({ kelas_id: createdClass.id, kelas: data.kelas + data.nomor_kelas });
        // });
        // const addClassToTeacher = await userCollRef.doc(data.wali).update({ kelas_id: createdClass.id, kelas: data.kelas + data.nomor_kelas });
        // return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

// ROSTER
exports.getMyRoster = functions.https.onCall(async (data) => {
    const db = admin.database();
    try {
        const roster = await db.ref(`rosters/${data.kelas_id}`).get();
        if (!roster.exists) {
            throw new functions.https.HttpsError("not-found", "roster tidak ditemukan");
        }
        return roster.toJSON();
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

// NEWS
exports.createNews = functions.https.onCall(async (data) => {
    const collNewsRef = admin.firestore().collection("news");
    try {
        await collNewsRef.add(data);
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getNews = functions.https.onCall(async (data) => {
    const collNewsRef = admin.firestore().collection("news").orderBy("tanggal_dibuat", "desc");

    try {
        const res = await collNewsRef.get();

        const news = [];
        res?.forEach((doc) => {
            news.push({
                ...doc.data(),
                id: doc.id,
            });
        });

        if (data?.query) {
            return news?.filter((ns) => ns?.judul?.toLowerCase()?.includes(data?.query?.toLowerCase()));
        }

        return news;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.detailNews = functions.https.onCall(async (data) => {
    const collNewsRef = admin.firestore().collection("news");
    try {
        const news = await collNewsRef.doc(data.id).get();
        if (!news.exists) {
            throw new functions.https.HttpsError("unknown", "data tidak ditemukan");
        }
        return news.data();
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.editNews = functions.https.onCall(async (data) => {
    const collNewsRef = admin.firestore().collection("news");
    try {
        await collNewsRef.doc(data.id).update(data);
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.deleteNews = functions.https.onCall(async (data) => {
    const collNewsRef = admin.firestore().collection("news");
    try {
        await collNewsRef.doc(data.id).delete();
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

// ABSENCE
exports.getAttendanceHistory = functions.https.onCall(async (data) => {
    const { students, month, cls } = data;
    const db = admin.database();

    try {
        const queries = [];
        students?.forEach((student) => {
            queries.push(db.ref(`attendances/${student.id}/${cls}/${month}`));
        });

        const res = await Promise.all(queries.map((q) => q.get())).then((results) => {
            return results?.map((doc) => doc.toJSON())?.map((el, i) => ({ attendance: el, id: students[i].id }));
        });

        return res;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.setOneAttendance = functions.https.onCall(async (data) => {
    const db = admin.database();

    try {
        await db.ref(`attendances/${data.student_id}/${data.cls}/${data.month}/${data.date}`).set(data.detail);
        return { sucess: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.setMultipleAttendance = functions.https.onCall(async (data) => {
    const db = admin.database();
    try {
        const queries = [
            ...data.students_id.map((id) => {
                const ref = db.ref(`attendances/${id}/${data.cls}/${data.month}/${data.date}`);
                return ref;
            }),
        ];

        await Promise.all(queries.map((q) => q.set(data.detail))).then((results) => {});

        return { sucess: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

// GRADES
exports.getGrade = functions.https.onCall(async (data) => {
    const db = admin.database();

    try {
        const req = await db.ref(`grades/${data.student_id}/${data.semester}`).get();
        if (!req.exists) return null;
        return req.toJSON() || null;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.setGrade = functions.https.onCall(async (data) => {
    const db = admin.database();

    try {
        await db.ref(`grades/${data.student_id}/${data.semester}`).set(data.grades);
        return { sucess: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getCountSemesterGrade = functions.https.onCall(async (data) => {
    const db = admin.database();

    try {
        const ref = db.ref(`grades/${data.student_id}`);
        const countSemester = await ref.once("value").then((snapshot) => snapshot.numChildren());
        return { semester: countSemester };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

// SPP
exports.getSPP = functions.https.onCall(async (data) => {
    const db = admin.database();

    try {
        const req = await db.ref(`spp/${data.student_id}/${data.class}`).get();
        if (!req.exists) return null;
        return req.toJSON() || null;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.setSPP = functions.https.onCall(async (data) => {
    const db = admin.database();

    try {
        await db.ref(`spp/${data.student_id}/${data.class}`).set(data.history);
        return { sucess: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

/// ///////////////////////////////////// STUDENT FUNCTIONS
exports.getMyGrades = functions.https.onCall(async (data) => {
    const db = admin.database();
    try {
        const req = await db.ref(`grades/${data.student_id}`).get();
        if (!req.exists) return null;
        return req.toJSON() || null;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getMySPP = functions.https.onCall(async (data) => {
    const db = admin.database();
    try {
        const req = await db.ref(`spp/${data.student_id}`).get();
        if (!req.exists) return null;
        return req.toJSON() || null;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getMyAttendance = functions.https.onCall(async (data) => {
    const db = admin.database();
    try {
        const req = await db.ref(`attendances/${data.student_id}`).get();
        if (!req.exists) return null;
        return req.toJSON() || null;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

// ///////////////////////////////////// TEACHER FUNCTIONS
exports.getSPPClass = functions.https.onCall(async (data) => {
    const db = admin.database();
    try {
        const queries = [];
        data?.ids?.forEach((id) => {
            const ref = db.ref(`spp/${id}/${data.class}`);
            queries.push(ref);
        });

        const spp = await Promise.all(queries.map((q) => q.get())).then((res) =>
            res.map((el, i) => ({
                id: data.ids[i],
                history: el.toJSON(),
            }))
        );
        return spp;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});
