interface String {
    CapitalizeFirstLetter(): string;
    CapitalizeEachFirstLetter(): string;
    ToIntegerFromIndCurrency(): number;
    CutText(lengt: number): string;
    LowerAndDashLetter(): string;
}

interface Number {
    ToIndCurrency(prefix?: string): string;
}
