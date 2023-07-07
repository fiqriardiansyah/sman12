const functions = require("firebase-functions");
const admin = require("firebase-admin");

const GMAIL = "@gmail.com";

admin.initializeApp();

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

exports.updateAccount = functions.https.onCall(async (data) => {
    try {
        await admin.auth().updateUser(data.uid, data.update);
        if (data.update?.email) {
            await admin.firestore().collection("users").doc(data.id).update({ email: data.update.email });
        }
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
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
        const userCollRef = admin.firestore().collection("users");
        const classCollRef = admin.firestore().collection("classes");
        const subjectCollRef = admin.firestore().collection("subjects");

        const findUid = await userCollRef.where("email", "==", data.email).get();
        let ifTeacher = null;
        let ifTeacherSubject = null;

        findUid.forEach(async (usr) => {
            if (usr.data()?.role === "student") {
                if (usr.data()?.kelas_id) {
                    const classStudentCollRef = classCollRef.doc(usr.data()?.kelas_id).collection("students");
                    const getMyClass = await classStudentCollRef.where("uid", "==", usr.data().uid).get();
                    getMyClass.forEach(async (st) => {
                        await classStudentCollRef.doc(st.id).delete();
                    });
                }
                userCollRef.doc(usr.id).delete();
                await admin.auth().deleteUser(usr.data().uid);
            }

            if (usr.data()?.role === "teacher") {
                ifTeacher = {
                    id: usr.id,
                    ...usr?.data(),
                };
            }
        });

        if (ifTeacher?.kelas_id) {
            throw new functions.https.HttpsError("unknown", `User adalah guru wali kelas ${ifTeacher?.kelas}`);
        }

        if (ifTeacher) {
            const getSubject = await subjectCollRef.where("guru_id", "==", ifTeacher.id).get();
            getSubject?.forEach((sub) => {
                ifTeacherSubject = {
                    id: sub.id,
                    ...sub.data(),
                };
            });
        }

        if (ifTeacherSubject) {
            throw new functions.https.HttpsError("unknown", `User adalah guru pelajaran ${ifTeacherSubject?.mata_pelajaran}`);
        }

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
            })
            .filter((student) => student?.kelas !== "LULUS");
    }

    return students?.filter((st) => st?.kelas !== "LULUS");
});

exports.getAlumni = functions.https.onCall(async (data) => {
    const req = await admin.firestore().collection("users").where("role", "==", "student").where("kelas", "==", "LULUS").get();
    const students = [];
    req?.forEach((student) => {
        students.push({
            ...student.data(),
            id: student.id,
        });
    });

    return students?.filter((st) => {
        if (!data?.query) return st;
        return (
            st?.nama?.toLowerCase()?.includes(data?.query?.toLowerCase()) ||
            st?.nisn?.toString()?.includes(data?.query) ||
            st?.nis?.toString()?.includes(data?.query)
        );
    });
});

exports.getAllStudent = functions.https.onCall(async () => {
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
    const prepareDate = data?.map((user) => ({
        email: user.nisn + GMAIL,
        password: user.nisn?.toString(),
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
//
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
    const req = await admin.firestore().collection("users").where("role", "in", ["staff", "admin"]).get();
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
            stambuk: data.stambuk,
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
            userCollRef.doc(student.id).update({ kelas_id: createdClass.id, kelas: data.kelas + data.nomor_kelas, stambuk: data.stambuk });
        });

        const createRoster = await db.ref(`rosters/${createdClass.id}`).set(data.rosters);

        const addClassToTeacher = await userCollRef.doc(data.wali).update({ kelas_id: createdClass.id, kelas: data.kelas + data.nomor_kelas });

        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.detailClass = functions.https.onCall(async (data) => {
    const firestor = admin.firestore();
    const db = admin.database();

    const docRef = firestor.collection("classes").doc(data.id);
    const userColRef = firestor.collection("users");

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

        const rosters = await db.ref(`rosters/${data.id}`).get();

        return {
            ...dataClass.data(),
            murid: dataStudents || [],
            rosters: rosters.toJSON(),
        };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.editClass = functions.https.onCall(async (data) => {
    const getClasses = await admin
        .firestore()
        .collection("classes")
        .where("kelas", "==", data.kelas)
        .where("nomor_kelas", "==", data.nomor_kelas)
        .get();

    let isThisClass = false;
    let currentDataClass;

    getClasses.forEach((doc) => {
        currentDataClass = {
            id: doc.id,
            ...doc.data(),
        };
        if (doc.id === data.id) {
            isThisClass = true;
        }
    });

    if (!getClasses.empty && !isThisClass) {
        throw new functions.https.HttpsError("already-exists", `kelas "${data.kelas}${data.nomor_kelas}" sudah ada`);
    }

    const classCollRef = admin.firestore().collection("classes");
    const userCollRef = admin.firestore().collection("users");
    const db = admin.database();

    try {
        await classCollRef.doc(data.id).update({
            wali_id: data.wali,
            wali_nama: data.wali_nama,
            kelas: data.kelas,
            nomor_kelas: data.nomor_kelas,
            nama_kelas: data.kelas + data.nomor_kelas,
            stambuk: data.stambuk,
        });

        if (currentDataClass.wali_id !== data.wali) {
            // new Teacher
            await userCollRef.doc(data.wali).update({ kelas_id: currentDataClass.id, kelas: data.kelas + data.nomor_kelas });
            // remove old teacher
            await userCollRef.doc(currentDataClass.wali_id).update({ kelas_id: null, kelas: null });
        }

        const studentsCollRef = classCollRef.doc(currentDataClass.id).collection("students");
        const currentStudents = await studentsCollRef.get();

        // remove student
        currentStudents?.forEach((student) => {
            studentsCollRef.doc(student.id).delete();
            userCollRef.doc(student.data().id).update({ kelas_id: null, kelas: null, stambuk: null });
        });

        // add kelas to new student
        const querieStudents = [];
        data?.murid?.forEach((id) => {
            const query = userCollRef.doc(id);
            querieStudents.push(query);
        });

        const students = await Promise.all(querieStudents.map((q) => q.get())).then((docs) => {
            return docs.map((doc) => ({ id: doc.id, uid: doc.data().uid }));
        });

        students?.forEach((student) => {
            studentsCollRef.add(student);
            userCollRef.doc(student.id).update({ kelas_id: currentDataClass.id, kelas: data.kelas + data.nomor_kelas, stambuk: data.stambuk });
        });

        const updateRosters = await db.ref(`rosters/${currentDataClass.id}`).update(data.rosters);

        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.deleteClass = functions.https.onCall(async (data) => {
    try {
        const classCollRef = admin.firestore().collection("classes");
        const userCollRef = admin.firestore().collection("users");
        const studentClassCollRef = classCollRef.doc(data.id).collection("students");
        const db = admin.database();

        const getStudents = await studentClassCollRef.get();
        getStudents?.forEach((student) => {
            studentClassCollRef.doc(student.id).delete();
            userCollRef.doc(student.data()?.id).update({ kelas_id: null, kelas: null });
        });

        const removeRoster = await db.ref(`rosters/${data.id}`).remove();
        const removeTeacher = await userCollRef.doc(data.wali_id).update({ kelas_id: null, kelas: null });
        const removeClass = await classCollRef.doc(data.id).delete();

        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

// ROSTER ///
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

        if (data?.query || data?.category) {
            return news
                ?.filter((ns) => {
                    if (!data?.query) return ns;
                    return ns?.judul?.toLowerCase()?.includes(data?.query?.toLowerCase());
                })
                .filter((ns) => {
                    if (!data?.category) return ns;
                    return Number(ns?.category) === Number(data?.category);
                });
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
    const sppCollRef = admin.firestore().collection("spp");

    try {
        await db.ref(`spp/${data.student_id}/${data.class}`).set(data.history);
        Object.keys(data.history).forEach((month) => {
            const spp = data.history[month];
            const id = data.student_id + data.class + month;
            if (!spp?.amount || !spp?.method || !spp?.pay_date) return;
            sppCollRef.doc(id).set({
                ...spp,
                student_id: data.student_id,
                month,
                class: data.class,
                pay_date_epoch: new Date(spp.pay_date),
            });
        });

        return { sucess: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getIncome = functions.https.onCall(async (data) => {
    const sppCollRef = admin.firestore().collection("spp");
    try {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);

        const list = [];
        const getSppToday = await sppCollRef.where("pay_date_epoch", ">=", start).where("pay_date_epoch", "<=", end).get();
        getSppToday?.forEach((doc) => {
            list.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        return list?.filter((el) => el?.legalized);
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getNotLegalizeSpp = functions.https.onCall(async (data) => {
    const sppCollRef = admin.firestore().collection("spp");
    try {
        const list = [];
        const getSppToday = await sppCollRef.get();
        getSppToday?.forEach((doc) => {
            list.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        return list?.filter((el) => el?.status === "pending");
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.setLegalizeSpp = functions.https.onCall(async (data) => {
    const db = admin.database();
    const sppCollRef = admin.firestore().collection("spp");
    try {
        await sppCollRef.doc(data.id).update({ legalized: data.legalized, legalized_date: new Date().getTime(), status: "approve" });
        await db
            .ref(`spp/${data.student_id}/${data.class}/${data.month}`)
            .update({ legalized: data.legalized, legalized_date: new Date().getTime(), status: "approve" });
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.setRejectSpp = functions.https.onCall(async (data) => {
    const db = admin.database();
    const sppCollRef = admin.firestore().collection("spp");
    try {
        await sppCollRef.doc(data.id).update({ status: "rejected", reason: data.reason });
        await db.ref(`spp/${data.student_id}/${data.class}/${data.month}`).update({ status: "rejected", reason: data.reason });
        return { success: true };
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

exports.createNoteToStudent = functions.https.onCall(async (data) => {
    const noteCollRef = admin.firestore().collection("notes");

    try {
        await noteCollRef.add(data);
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getNoteByStudent = functions.https.onCall(async (data) => {
    const noteCollRef = admin.firestore().collection("notes");

    try {
        const req = await noteCollRef.where("student_id", "==", data.student_id).get();
        const notes = [];
        req?.forEach((note) => {
            notes.push({
                ...note.data(),
                id: note.id,
            });
        });
        return notes?.sort((a, b) => b.send_date - a.send_date);
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.editNoteToStudent = functions.https.onCall(async (data) => {
    const noteCollRef = admin.firestore().collection("notes").doc(data.id);

    try {
        await noteCollRef.update(data);
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.deleteNoteToStudent = functions.https.onCall(async (data) => {
    const noteCollRef = admin.firestore().collection("notes").doc(data.id);

    try {
        await noteCollRef.delete();
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.noteSeenByStudent = functions.https.onCall(async (data) => {
    const noteCollRef = admin.firestore().collection("notes");

    try {
        const queries = [];
        data?.notes?.forEach(async (note) => {
            queries.push(noteCollRef.doc(note.id));
        });

        await Promise.all(queries.map((q) => q.update({ receiver_seen: true })));

        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.noteSeenByTeacher = functions.https.onCall(async (data) => {
    const noteCollRef = admin.firestore().collection("notes");

    try {
        await noteCollRef.doc(data.id).update({ teacher_seen: true });
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getNotesByTeacher = functions.https.onCall(async (data) => {
    const noteCollRef = admin.firestore().collection("notes");
    const userCollRef = admin.firestore().collection("users");

    try {
        const classId = data.kelas_id;
        const getStudentClass = await userCollRef.where("kelas_id", "==", classId).get();
        const students = [];
        getStudentClass?.forEach((doc) => {
            const student = {
                id: doc.id,
                ...doc.data(),
            };
            students.push(student);
        });

        const querieNotes = [];
        students?.forEach((student) => {
            const queri = noteCollRef.where("student_id", "==", student.id);
            querieNotes.push(queri);
        });

        const notes = [];
        await Promise.all(querieNotes.map((q) => q.get())).then((res) => {
            res.forEach((snap) => {
                snap?.forEach((doc) => {
                    notes.push({
                        id: doc.id,
                        ...doc.data(),
                        student_name: students?.find((s) => s.id === doc.data().student_id)?.nama,
                    });
                });
            });
        });

        return notes?.sort((a, b) => b.send_date - a.send_date);
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

/// ////////////////////////////////////// OTHER FUNCTIONS
exports.newAcademicYear = functions.https.onCall(async (data) => {
    const classCollRef = admin.firestore().collection("classes");
    const userCollRef = admin.firestore().collection("users");
    const academyYearCollRef = admin.firestore().collection("academicyear");

    try {
        const allStudents = await userCollRef.where("role", "==", "student").get();
        const allTeachers = await userCollRef.where("role", "==", "teacher").get();

        // remove all teacer class
        const queries = [];
        allTeachers?.forEach((doc) => {
            queries.push(userCollRef.doc(doc.id));
        });
        await Promise.all(queries.map((q) => q.update({ kelas: null, kelas_id: null })));
        // ////

        // set new class/graduate to students
        allStudents?.forEach(async (doc) => {
            const student = doc.data();
            const myClass = data?.list?.find((cls) => cls.id === student.kelas_id);
            if (!myClass) return;
            await userCollRef.doc(doc.id).update({
                kelas: myClass.kelas_baru === "LULUS" ? "LULUS" : myClass.kelas_baru + myClass.nomor_kelas,
                lulus: myClass.kelas_baru === "LULUS" ? new Date().getFullYear() : null,
            });
        });
        ///

        /// update/delete data class
        data?.list?.forEach(async (cls) => {
            if (cls.kelas_baru === "LULUS") {
                await classCollRef.doc(cls.id).delete();
                return;
            }
            await classCollRef.doc(cls.id).update({
                wali_id: cls.wali_id_baru,
                wali_nama: cls.wali_nama_baru,
                kelas: cls.kelas_baru,
                nama_kelas: cls.kelas_baru + cls.nomor_kelas,
            });
            await userCollRef.doc(cls.wali_id_baru).update({ kelas: cls.kelas_baru, kelas_id: cls.id });
        });

        academyYearCollRef.add({ year: new Date().getFullYear() });

        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getLatestAcademicYearUpdate = functions.https.onCall(async (data) => {
    const academyYearCollRef = admin.firestore().collection("academicyear");
    try {
        const years = [];
        const req = await academyYearCollRef.get();
        req?.forEach((doc) => {
            years.push(doc.data().year);
        });

        if (years.length === 0) return null;
        return years?.sort((a, b) => a - b)[years.length - 1];
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getAllAcademicYear = functions.https.onCall(async (data) => {
    const academyYearCollRef = admin.firestore().collection("academicyear");
    try {
        const years = [];
        const req = await academyYearCollRef.get();
        req?.forEach((doc) => {
            years.push(doc.data().year);
        });

        if (years.length === 0) return null;
        return years?.sort((a, b) => a - b);
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});
