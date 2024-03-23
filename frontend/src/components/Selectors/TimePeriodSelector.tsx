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
    // print start end dates
    let startDateCalc = new Date(0);
    const endDateCalc = new Date();
    switch (event.target.value) {
      case 'lastWeek':
        startDateCalc = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
          period: 'week',
        });
        break;
      case 'lastMonth':
        startDateCalc = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
          period: 'month',
        });
        setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        break;
      case 'lastThreeMonths':
        startDateCalc = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
          period: 'month',
        });
        break;
      case 'lastSixMonths':
        startDateCalc = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
          period: 'month',
        });
        break;
      case 'lastYear':
        startDateCalc = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
          period: 'year',
        });
        break;
      case 'custom':
        // do nothing, wait for user to select custom dates
        break;
      default:
        onTimePeriodChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
          period: 'unknown',
        });
        break;
    }
    setStartDate(startDateCalc);
    setEndDate(endDateCalc);
  };

  const handleCustomDatesChange = () => {
    onTimePeriodChange({
      startDate,
      endDate,
      period: 'custom',
    });
  };

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
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
            handleCustomDatesChange();
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
            handleCustomDatesChange();
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