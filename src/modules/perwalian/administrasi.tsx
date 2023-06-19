import ViewSppHistory from "modules/sppsiswa/view-spp-history";

function Administrasi(props: { studentId: any; kelas: any }) {
    return (
        <div className="">
            <h1 className="m-0 mb-10 pt-4">SPP siswa</h1>
            <ViewSppHistory {...props} />
        </div>
    );
}

export default Administrasi;
