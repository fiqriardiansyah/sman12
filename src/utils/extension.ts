/* eslint-disable no-restricted-globals */
/* eslint-disable no-extend-native */
/* eslint-disable func-names */
String.prototype.CapitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.CapitalizeEachFirstLetter = function () {
    return this.toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
        .join(" ");
};

String.prototype.ToIntegerFromIndCurrency = function () {
    if (isNaN(this as any)) return 0;
    return parseInt(this.toString().split(".").join(""), 10);
};

String.prototype.CutText = function (length: number) {
    return this?.length > length ? `${this!.slice(0, length)}...` : this.toString();
};

String.prototype.LowerAndDashLetter = function (separator?: string) {
    return this.toLowerCase()
        .split(separator || " ")
        .join("-");
};

Number.prototype.ToIndCurrency = function (prefix?: string) {
    const currency = this.toLocaleString("id-ID", {
        style: "decimal",
        currency: "IDN",
    });
    if (prefix) return `${prefix}. ${currency}`;
    return currency;
};

export default {};
