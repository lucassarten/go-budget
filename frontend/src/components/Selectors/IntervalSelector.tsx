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
    // print start end dates
    let startDateCalc = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDateCalc = new Date();
    switch (event.target.value) {
      case 'day':
        startDateCalc = new Date(Date.now() - 24 * 60 * 60 * 1000);
        onIntervalChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      case 'week':
        startDateCalc = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        onIntervalChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      case 'month':
        startDateCalc = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        onIntervalChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      case 'year':
        startDateCalc = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        onIntervalChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
      default:
        onIntervalChange({
          startDate: startDateCalc,
          endDate: endDateCalc,
        });
        break;
    }
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