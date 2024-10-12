export enum IntervalValue {
    Day = "Day",
    Week = "Week",
    Month = "Month",
    Year = "Year"
}

export enum PeriodValue {
    LastWeek = "Last Week",
    LastMonth = "Last Month",
    LastThreeMonths = "Last 3 Months",
    LastSixMonths = "Last 6 Months",
    LastYear = "Last Year",
    All = "All",
    Custom = "Custom"
}

export interface TimeInterval {
    startDate: Date;
    endDate: Date;
    interval: IntervalValue;
}

export interface TimePeriod {
    startDate: Date;
    endDate: Date;
    period: PeriodValue;
}
