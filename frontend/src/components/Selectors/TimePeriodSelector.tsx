import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { useState } from 'react';

import { TimePeriod } from '../Dashboard/Dashboard';

interface TimePeriodSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onTimePeriodChange: (timePeriod: TimePeriod) => void;
}

const validateDate = (value: Date) => {
  try {
    value.toISOString();
    return true;
  } catch (e) {
    return false;
  }
};

function TimePeriodSelector({ onTimePeriodChange }: TimePeriodSelectorProps) {
  const [selectedOption, setSelectedOption] = useState('all');
  const [startDate, setStartDate] = useState<Date>(new Date(0));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleOptionChange = (event: SelectChangeEvent<string>) => {
    setSelectedOption(event.target.value);
    let startDateCalc, endDateCalc;

    switch (event.target.value) {
      case 'lastWeek':
        startDateCalc = new Date();
        startDateCalc.setDate(startDateCalc.getDate() - startDateCalc.getDay() + 1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setDate(endDateCalc.getDate() + 6);
        break;
      case 'lastMonth':
        startDateCalc = new Date();
        startDateCalc.setDate(1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setMonth(endDateCalc.getMonth() + 1);
        endDateCalc.setDate(endDateCalc.getDate() - 1);
        break;
      case 'lastThreeMonths':
        startDateCalc = new Date();
        startDateCalc.setDate(1);
        startDateCalc.setMonth(startDateCalc.getMonth() - 2);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setMonth(endDateCalc.getMonth() + 3);
        endDateCalc.setDate(endDateCalc.getDate() - 1);
        break;
      case 'lastSixMonths':
        startDateCalc = new Date();
        startDateCalc.setDate(1);
        startDateCalc.setMonth(startDateCalc.getMonth() - 5);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setMonth(endDateCalc.getMonth() + 6);
        endDateCalc.setDate(endDateCalc.getDate() - 1);
        break;
      case 'lastYear':
        startDateCalc = new Date();
        startDateCalc.setMonth(0);
        startDateCalc.setDate(1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setFullYear(endDateCalc.getFullYear() + 1);
        endDateCalc.setDate(endDateCalc.getDate() - 1);
        break;
      case 'custom':
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

    onTimePeriodChange({
      startDate: startDateCalc,
      endDate: endDateCalc,
      period: event.target.value,
    });
  };

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    handleOptionChange({
      target: { value: 'custom' },
    } as SelectChangeEvent<string>);
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    handleOptionChange({
      target: { value: 'custom' },
    } as SelectChangeEvent<string>);
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
          <MenuItem value="lastWeek">Last Week</MenuItem>
          <MenuItem value="lastMonth">Last Month</MenuItem>
          <MenuItem value="lastThreeMonths">Last 3 Months</MenuItem>
          <MenuItem value="lastSixMonths">Last 6 Months</MenuItem>
          <MenuItem value="lastYear">Last Year</MenuItem>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="custom">Custom</MenuItem>
        </Select>
      </FormControl>
      <div className="time-period-custom-container">
        <TextField
          label="Start Date"
          id="startDatePicker"
          onChange={(e) => {
            handleStartDateChange(new Date(e.target.value));
          }}
          onBlur={(e) => {
            handleOptionChange({
              target: { value: 'custom' },
            } as SelectChangeEvent<string>);
          }}
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          disabled={selectedOption !== 'custom'}
          value={
            validateDate(startDate) ? startDate.toISOString().split('T')[0] : ''
          }
        />
        <TextField
          label="End Date"
          id="endDatePicker"
          onChange={(e) => {
            handleEndDateChange(new Date(e.target.value));
          }}
          onBlur={(e) => {
            handleOptionChange({
              target: { value: 'custom' },
            } as SelectChangeEvent<string>);
          }}
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          disabled={selectedOption !== 'custom'}
          value={
            validateDate(endDate) ? endDate.toISOString().split('T')[0] : ''
          }
        />
      </div>
    </>
  );
}

export default TimePeriodSelector;