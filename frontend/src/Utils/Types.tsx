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

export function getIntervalFactor(period: TimePeriod, interval: IntervalValue): number {
    const daysInPeriod = (period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24);

    switch (interval) {
        case IntervalValue.Day:
            return daysInPeriod;
        case IntervalValue.Week:
            return daysInPeriod / 7;
        case IntervalValue.Month:
            return daysInPeriod / (365 / 12);
        case IntervalValue.Year:
            return daysInPeriod / 365;
        default:
            return daysInPeriod;
    }
}
