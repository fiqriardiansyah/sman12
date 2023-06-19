import { UserContext } from "context/user";
import ViewSppHistory from "modules/sppsiswa/view-spp-history";
import { useContext } from "react";

function StudentSPP() {
    const { state } = useContext(UserContext);
    return (
        <div className="w-full">
            <h1 className="m-0 mb-10 pt-4">Catatan SPP siswa</h1>
            <ViewSppHistory kelas={state?.user?.kelas} studentId={state?.user?.id} />
        </div>
    );
}

export default StudentSPP;
