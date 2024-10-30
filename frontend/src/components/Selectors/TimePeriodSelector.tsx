import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { useState } from 'react';

import { DateField } from '@mui/x-date-pickers';
import { PeriodValue, TimePeriod } from '../../Utils/Types';

interface TimePeriodSelectorProps {
  onTimePeriodChange: (timePeriod: TimePeriod) => void;
  firstDate: number;
}

function TimePeriodSelector({ onTimePeriodChange, firstDate }: TimePeriodSelectorProps) {
  const [selectedOption, setSelectedOption] = useState(PeriodValue.All);
  const [startDate, setStartDate] = useState<Date>(new Date(firstDate || 0));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleOptionChange = (event: SelectChangeEvent<PeriodValue>) => {
    setSelectedOption(event.target.value as PeriodValue);
    let startDateCalc, endDateCalc;
    switch (event.target.value as PeriodValue) {
      case PeriodValue.LastWeek:
        startDateCalc = new Date();
        startDateCalc.setDate(startDateCalc.getDate() - startDateCalc.getDay() + 1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setDate(endDateCalc.getDate() + 6);
        break;
      case PeriodValue.LastMonth:
        startDateCalc = new Date();
        startDateCalc.setDate(1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setMonth(endDateCalc.getMonth() + 1);
        endDateCalc.setDate(endDateCalc.getDate() - 1);
        break;
      case PeriodValue.LastThreeMonths:
        startDateCalc = new Date();
        startDateCalc.setDate(1);
        startDateCalc.setMonth(startDateCalc.getMonth() - 2);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setMonth(endDateCalc.getMonth() + 3);
        endDateCalc.setDate(endDateCalc.getDate() - 1);
        break;
      case PeriodValue.LastSixMonths:
        startDateCalc = new Date();
        startDateCalc.setDate(1);
        startDateCalc.setMonth(startDateCalc.getMonth() - 5);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setMonth(endDateCalc.getMonth() + 6);
        endDateCalc.setDate(endDateCalc.getDate() - 1);
        break;
      case PeriodValue.LastYear:
        startDateCalc = new Date();
        startDateCalc.setMonth(0);
        startDateCalc.setDate(1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setFullYear(endDateCalc.getFullYear() + 1);
        endDateCalc.setDate(endDateCalc.getDate() - 1);
        break;
      case PeriodValue.All:
        startDateCalc = new Date(firstDate);
        endDateCalc = new Date();
        break;
      case PeriodValue.Custom:
        startDateCalc = startDate;
        endDateCalc = endDate;
        break;
      default:
        startDateCalc = new Date();
        startDateCalc.setDate(startDateCalc.getDate() - startDateCalc.getDay() + 1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setDate(endDateCalc.getDate() + 6);
        break;
    }

    startDateCalc.setHours(0, 0, 0, 0);
    endDateCalc.setHours(23, 59, 59, 999);

    setStartDate(startDateCalc);
    setEndDate(endDateCalc);

    onTimePeriodChange({
      startDate: startDateCalc,
      endDate: endDateCalc,
      period: event.target.value as PeriodValue,
    });
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date != null) {
      setStartDate(date);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date != null) {
      setEndDate(date)
    }
  };

  return (
    <>
      <FormControl>
        <InputLabel id="timePeriodSelectLabel">Time Period</InputLabel>
        <Select
          labelId="timePeriodSelectLabel"
          className="time-period-selector"
          id="timePeriodSelect"
          value={selectedOption}
          label="Time Period"
          onChange={handleOptionChange}
        >
          {Object.values(PeriodValue).map((period) => (
            <MenuItem key={period} value={period}>
              {period}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className="time-period-custom-container">
        <DateField
          label="Start Date"
          id="startDatePicker"
          onChange={(newValue) => {
            handleStartDateChange(newValue);
          }}
          onBlur={(e) => {
            handleOptionChange({
              target: { value: PeriodValue.Custom },
            } as SelectChangeEvent<PeriodValue>);
          }}
          InputLabelProps={{
            shrink: true,
          }}
          disabled={selectedOption !== PeriodValue.Custom}
          value={startDate}
        />
        <DateField
          label="End Date"
          id="endDatePicker"
          onChange={(newValue) => {
            handleEndDateChange(newValue);
          }}
          onBlur={(e) => {
            handleOptionChange({
              target: { value: PeriodValue.Custom },
            } as SelectChangeEvent<PeriodValue>);
          }}
          InputLabelProps={{
            shrink: true,
          }}
          disabled={selectedOption !== PeriodValue.Custom}
          value={endDate}
        />
      </div>
    </>
  );
}

export default TimePeriodSelector;