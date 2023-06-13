import { Button, Popover } from "antd";

type Props = {
    date: number;
    onChange?: (val: string) => void;
    loading?: boolean;
    canInteract?: boolean;
};

function BoxDate({ date, onChange, loading, canInteract = true }: Props) {
    const onClick = (status: string) => {
        return () => {
            if (onChange) onChange(status);
        };
    };

    const content = (
        <div className="flex flex-col gap-5">
            <Button size="small" disabled={loading} onClick={onClick("h")}>
                Hadir
            </Button>
            <Button size="small" disabled={loading} onClick={onClick("l")}>
                Libur / Dll
            </Button>
            <Button size="small" disabled={loading} onClick={onClick("n")}>
                Netral
            </Button>
            {date > 28 && (
                <Button size="small" disabled={loading} onClick={onClick("x")}>
                    Hapus Tanggal
                </Button>
            )}
        </div>
    );

    if (!canInteract) {
        return (
            <div className="w-full flex items-center justify-center">
                <p className="m-0 text-white font-semibold">{date}</p>
            </div>
        );
    }

    return (
        <Popover trigger={["click"]} content={content}>
            <div className="w-full flex items-center justify-center hover:opacity-25" title="Buka pilihan">
                <p className="m-0 text-white cursor-pointer font-semibold">{date}</p>
            </div>
        </Popover>
    );
}

export default BoxDate;
