import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useState } from 'react';

import { TimePeriod } from '../Dashboard/Dashboard';

interface IntervalSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onIntervalChange: (timePeriod: TimePeriod) => void;
  // eslint-disable-next-line no-unused-vars
}

function IntervalSelector({ onIntervalChange }: IntervalSelectorProps) {
  const [selectedOption, setSelectedOption] = useState('week');

  const handleOptionChange = (event: SelectChangeEvent<string>) => {
    setSelectedOption(event.target.value);
    let startDateCalc, endDateCalc;

    switch (event.target.value) {
      case 'day':
        endDateCalc = new Date();
        startDateCalc = new Date();
        startDateCalc.setDate(startDateCalc.getDate() - 1);
        break;
      case 'week':
        startDateCalc = new Date();
        startDateCalc.setDate(startDateCalc.getDate() - startDateCalc.getDay() + 1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setDate(endDateCalc.getDate() + 6);
        break;
      case 'month':
        startDateCalc = new Date();
        startDateCalc.setDate(1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setMonth(endDateCalc.getMonth() + 1);
        endDateCalc.setDate(endDateCalc.getDate() - 1);
        break;
      case 'year':
        startDateCalc = new Date();
        startDateCalc.setMonth(0);
        startDateCalc.setDate(1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setFullYear(endDateCalc.getFullYear() + 1);
        endDateCalc.setDate(endDateCalc.getDate() - 1);
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

    console.log(startDateCalc, endDateCalc);

    onIntervalChange({
      startDate: startDateCalc,
      endDate: endDateCalc,
      period: event.target.value,
    });
  };

  return (
    <FormControl>
      <InputLabel id="intervalSelectLabel">Interval</InputLabel>
      <Select
        labelId="intervalSelectLabel"
        className="interval-selector"
        id="intervalSelect"
        label="Interval"
        value={selectedOption}
        onChange={handleOptionChange}
      >
        <MenuItem value="day">Day</MenuItem>
        <MenuItem value="week">Week</MenuItem>
        <MenuItem value="month">Month</MenuItem>
        <MenuItem value="year">Year</MenuItem>
      </Select>
    </FormControl>
  );
}

export default IntervalSelector;