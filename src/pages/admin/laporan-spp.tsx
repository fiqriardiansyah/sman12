import { Alert, Card, DatePicker, Skeleton } from "antd";
import { Chart as ChartJS, registerables } from "chart.js";
import StateRender from "components/common/state";
import dayjs, { Dayjs } from "dayjs";
import { httpsCallable } from "firebase/functions";
import { Siswa } from "modules/datasiswa/table";
import { Staff } from "modules/datastaff/table";
import moment from "moment";
import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { FaFileDownload } from "react-icons/fa";
import { useQuery } from "react-query";
import { functionInstance } from "service/firebase-instance";
import Utils from "utils";
import { FORMATE_DATE_TIME, FORMAT_DATE, SPP_PAYMENT_METHOD } from "utils/constant";

ChartJS.register(...registerables);

const getIncome = httpsCallable(functionInstance, "getIncome");
const getStudents = httpsCallable(functionInstance, "getStudents");
const getStaffs = httpsCallable(functionInstance, "getStaffs");

function LaporanSPP() {
    const [year, setYear] = useState<any>(new Date().getFullYear());

    const studentQuery = useQuery(["get-student"], async () => {
        return (await getStudents()).data as Siswa[];
    });

    const staffQuery = useQuery(["get-staffs"], async () => {
        return (await getStaffs()).data as Staff[];
    });

    const getTodayIncomeQuery = useQuery(["get-today-income"], async () => {
        const today = moment(moment.now()).format("DD MMM YYYY");
        const startDate = `${today} 00:00:00`;
        const endDate = `${today} 23:59:00`;
        return (await getIncome({ start_date: startDate, end_date: endDate })).data as any[];
    });

    const getMonthIncomeQuery = useQuery(["get-month-income"], async () => {
        const startOfMonth = moment().startOf("month").format("DD MMM YYYY HH:mm:ss");
        const endOfMonth = moment().endOf("month").format("DD MMM YYYY HH:mm:ss");
        return (await getIncome({ start_date: startOfMonth, end_date: endOfMonth })).data as any[];
    });

    const getYearIncomeQuery = useQuery(["get-year-income", year], async () => {
        const startOfYear = moment(moment(year, "YYYY").toISOString()).startOf("year").format("DD MMM YYYY HH:mm:ss");
        const endOfYear = moment(moment(year, "YYYY").toISOString()).endOf("year").format("DD MMM YYYY HH:mm:ss");
        return (await getIncome({ start_date: startOfYear, end_date: endOfYear })).data as any[];
    });

    const totalTodayIncome = getTodayIncomeQuery.data?.reduce((a, b) => a + b.amount, 0);
    const totalTodayTransfer = getTodayIncomeQuery.data?.filter((el) => Number(el.method) === 1)?.length;
    const totalTodayCash = getTodayIncomeQuery.data?.filter((el) => Number(el.method) === 2)?.length;

    const totalMonthIncome = getMonthIncomeQuery.data?.reduce((a, b) => a + b.amount, 0);
    const totalMonthTransfer = getMonthIncomeQuery.data?.filter((el) => Number(el.method) === 1)?.length;
    const totalMonthCash = getMonthIncomeQuery.data?.filter((el) => Number(el.method) === 2)?.length;

    const totalYearIncome = getYearIncomeQuery.data?.reduce((a, b) => a + b.amount, 0);
    const totalYearTransfer = getYearIncomeQuery.data?.filter((el) => Number(el.method) === 1)?.length;
    const totalYearCash = getYearIncomeQuery.data?.filter((el) => Number(el.method) === 2)?.length;

    const tDatasets = getYearIncomeQuery.data?.reduce((a, b) => {
        return {
            ...a,
            [b.month]: [...(Object.keys(a).length ? a[b.month] || [] : []), b],
        };
    }, {});

    const chartPemasukan = {
        labels: moment.months(),
        datasets: [
            {
                label: `Pemasukan tahun ${year}`,
                data: moment.months().map((month) => ({
                    x: month,
                    y: tDatasets ? tDatasets[month?.toLowerCase()]?.reduce((a: any, b: any) => a + b.amount, 0) || 0 : 0,
                })),
                fill: true,
                lineTension: 0.5,
                pointStyle: "circle",
                pointRadius: 10,
                pointHoverRadius: 15,
                min: 0,
                beginAtZero: true,
            },
        ],
    };

    const chartMethodPayment = {
        labels: SPP_PAYMENT_METHOD.map((el) => el.label),
        datasets: [
            {
                label: `Metode pembayaran ${year}`,
                data: SPP_PAYMENT_METHOD.map((method) => ({
                    x: method.label,
                    y: getYearIncomeQuery.data?.filter((el) => el.method === method.value)?.length,
                })),
            },
        ],
    };

    const onChangeYear = (value: Dayjs | null) => {
        if (!value) return;
        setYear(dayjs(value).format("YYYY"));
    };

    const tPrintData = (arr: any[]) => {
        return arr?.map((spp) => {
            const siswa = studentQuery.data?.find((st) => st.id === spp.student_id);
            const staff = staffQuery.data?.find((st) => st.id === spp.author_id);
            return {
                "Nama siswa": siswa?.nama,
                Kelas: siswa?.kelas,
                "Pelusanan bulan": spp.month,
                "Tanggal bayar": spp.pay_date,
                Jumlah: (spp.amount as number)?.ToIndCurrency("Rp"),
                "Cara bayar": SPP_PAYMENT_METHOD.find((el) => el.value === spp.method)?.label,
                "Dicatat oleh": staff?.nama,
                Catatan: spp.note,
            };
        });
    };

    const downloadTodayIncome = () => {
        if (!getTodayIncomeQuery.data?.length) return;
        Utils.ExportToExcel(`Pemasukan hari ${moment().format(FORMATE_DATE_TIME)}`, tPrintData(getTodayIncomeQuery.data));
    };

    const downloadMonthIncome = () => {
        if (!getMonthIncomeQuery.data?.length) return;
        Utils.ExportToExcel(`Pemasukan bulan ${moment().format("MMM")} tahun ${year}`, tPrintData(getMonthIncomeQuery.data));
    };

    const downloadYearIncome = () => {
        if (!getYearIncomeQuery.data?.length) return;
        Utils.ExportToExcel(`Pemasukan tahun ${year}`, tPrintData(getYearIncomeQuery.data));
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="w-full flex items-center justify-between mt-5">
                <h1 className="m-0">Laporan SPP</h1>
            </div>
            <StateRender data={getTodayIncomeQuery.data} isLoading={getTodayIncomeQuery.isLoading} isError={getTodayIncomeQuery.isError}>
                <StateRender.Data>
                    <section className="flex flex-col gap-4">
                        <div className="w-full grid grid-cols-4 gap-5">
                            <div className="rounded bg-green-300 p-3 flex flex-col items-center relative">
                                {!studentQuery.isLoading && !staffQuery.isLoading && (
                                    <FaFileDownload
                                        onClick={downloadTodayIncome}
                                        className="!text-white absolute top-1 right-1 text-xl cursor-pointer hover:opacity-50"
                                        color="#ffffff"
                                    />
                                )}
                                <span className="text-white font-semibold">Pemasukan hari ini</span>
                                <p className="text-white text-3xl font-semibold m-0 my-4">{totalTodayIncome?.ToIndCurrency("Rp")}</p>
                                <div className="w-full flex items-center my-2 justify-between" style={{ borderTop: "1px solid white" }}>
                                    <p className="text-white m-0">Transfer: {totalTodayTransfer}</p>
                                    <p className="text-white m-0">Tunai: {totalTodayCash}</p>
                                </div>
                            </div>
                            <div className="rounded bg-blue-300 p-3 flex flex-col items-center relative">
                                {!studentQuery.isLoading && !staffQuery.isLoading && (
                                    <FaFileDownload
                                        onClick={downloadMonthIncome}
                                        className="!text-white absolute top-1 right-1 text-xl cursor-pointer hover:opacity-50"
                                        color="#ffffff"
                                    />
                                )}
                                <span className="text-white font-semibold">Pemasukan bulan ini</span>
                                <p className="text-white text-3xl font-semibold m-0 my-4">{totalMonthIncome?.ToIndCurrency("Rp")}</p>
                                <div className="w-full flex items-center my-2 justify-between" style={{ borderTop: "1px solid white" }}>
                                    <p className="text-white m-0">Transfer: {totalMonthTransfer}</p>
                                    <p className="text-white m-0">Tunai: {totalMonthCash}</p>
                                </div>
                            </div>
                            <div className="rounded bg-yellow-400 p-3 flex flex-col items-center relative">
                                {!studentQuery.isLoading && !staffQuery.isLoading && (
                                    <FaFileDownload
                                        onClick={downloadYearIncome}
                                        className="!text-white absolute top-1 right-1 text-xl cursor-pointer hover:opacity-50"
                                        color="#ffffff"
                                    />
                                )}
                                <span className="text-white font-semibold">Pemasukan tahun {year}</span>
                                <p className="text-white text-3xl font-semibold m-0 my-4">{totalYearIncome?.ToIndCurrency("Rp")}</p>
                                <div className="w-full flex items-center my-2 justify-between" style={{ borderTop: "1px solid white" }}>
                                    <p className="text-white m-0">Transfer: {totalYearTransfer}</p>
                                    <p className="text-white m-0">Tunai: {totalYearCash}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <Card>
                        <DatePicker.YearPicker onChange={onChangeYear} />
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3">
                                <Line data={chartPemasukan as any} />
                            </div>
                            <div className="col-span-1">
                                <Bar data={chartMethodPayment as any} />
                            </div>
                        </div>
                    </Card>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton active />
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert type="error" message={(getTodayIncomeQuery.error as any)?.message} />
                </StateRender.Error>
            </StateRender>
        </div>
    );
}

export default LaporanSPP;
