import TableAbsensiKelas from "modules/absensisiswa/table";
import { Kelas } from "modules/datakelas/table";
import { Siswa } from "modules/datasiswa/table";

function InfoSiswaAbsensi() {
    const kelas: Kelas[] = [
        {
            id: "12",
            nama: "XII IPA 1",
            wali: "ahmad dani",
        },
        {
            id: "23",
            nama: "XII IPA 2",
            wali: "mulan jamila",
        },
        {
            id: "353",
            nama: "XII IPA 3",
            wali: "al gazali",
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Absensi Siswa</h1>
            </div>
            <TableAbsensiKelas kelas={kelas} />
        </div>
    );
}

export default InfoSiswaAbsensi;
