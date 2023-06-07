import { Siswa } from "modules/datasiswa/table";
import TableSppSiswa from "modules/sppsiswa/table";

function InfoSiswaSpp() {
    const siswa: Siswa[] = [
        {
            id: "12",
            nama: "sugiono",
            kelas: "XII IPA 1",
            nis: "12341234234234",
            nisn: "345634563e456",
        },
        {
            id: "12234",
            nama: "ahmad dani",
            kelas: "XII IPA 2",
            nis: "12341234234asdf234",
            nisn: "f2432323",
        },
        {
            id: "2",
            nama: "jono sugigi",
            kelas: "XII IPA 14",
            nis: "1232342",
            nisn: "34545",
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">SPP Siswa</h1>
            </div>
            <TableSppSiswa siswa={siswa} />
        </div>
    );
}

export default InfoSiswaSpp;
