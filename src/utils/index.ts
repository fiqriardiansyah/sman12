/* eslint-disable no-redeclare */
/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable block-scoped-var */
/* eslint-disable no-useless-concat */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prettier/prettier */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import Cookies from "js-cookie";
import * as FileSaver from "file-saver";
import XLSX from "sheetjs-style";
import { CLASSES, GMAIL, TOKEN_USER } from "./constant";

const Utils = {
    SignOut() {
        Cookies.remove(TOKEN_USER);
    },
    DropGmail(str?: string | undefined | null) {
        if (!str) return "";
        const split = str.split(GMAIL);
        return split[0];
    },
    JsonToCSV({ json, title, showLabel }: { json: JSON; title: string; showLabel: boolean }) {
        const arrData = typeof json !== "object" ? JSON.parse(json) : json;

        let CSV = "sep=," + "\r\n\n";
        if (showLabel) {
            var row = "";
            for (var index in arrData[0]) {
                row += `${index},`;
            }

            row = row.slice(0, -1);
            CSV += `${row}\r\n`;
        }

        for (let i = 0; i < arrData.length; i++) {
            var row = "";
            for (var index in arrData[i]) {
                row += `"${arrData[i][index]}",`;
            }
            row.slice(0, row.length - 1);
            CSV += `${row}\r\n`;
        }

        if (CSV === "") {
            alert("Invalid data");
            return;
        }

        const uri = `data:text/csv;charset=utf-8,${escape(CSV)}`;

        const link = document.createElement("a");
        link.href = uri;

        link.style.visibility = "hidden";
        link.download = `${title}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    SplitStrKelas(str: any) {
        if (!str) return CLASSES[0];
        const regex = /([a-zA-Z]+)(\d+)/;
        const splitStr = str?.match(regex) as any;
        return splitStr[1];
    },
    ExportToExcel(fileName: string, json: any) {
        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";
        const ws = XLSX.utils.json_to_sheet(json);
        const excelBuffer = XLSX.write(
            {
                Sheets: { data: ws },
                SheetNames: ["data"],
            },
            { bookType: "xlsx", type: "array" }
        );
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    },
};

export default Utils;
