import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useState } from 'react';

import { IntervalValue, TimeInterval } from '../../Utils/Types';

interface IntervalSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onIntervalChange: (timePeriod: TimeInterval) => void;
  // eslint-disable-next-line no-unused-vars
}

function IntervalSelector({ onIntervalChange }: IntervalSelectorProps) {
  const [selectedOption, setSelectedOption] = useState(IntervalValue.Week);

  const handleOptionChange = (event: SelectChangeEvent<IntervalValue>) => {
    setSelectedOption(event.target.value as IntervalValue);
    let startDateCalc, endDateCalc;

    switch (event.target.value as IntervalValue) {
      case IntervalValue.Day:
        endDateCalc = new Date();
        startDateCalc = new Date();
        startDateCalc.setDate(startDateCalc.getDate() - 1);
        break;
      case IntervalValue.Week:
        startDateCalc = new Date();
        startDateCalc.setDate(startDateCalc.getDate() - startDateCalc.getDay() + 1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setDate(endDateCalc.getDate() + 6);
        break;
      case IntervalValue.Month:
        startDateCalc = new Date();
        startDateCalc.setDate(1);
        endDateCalc = new Date(startDateCalc);
        endDateCalc.setMonth(endDateCalc.getMonth() + 1);
        endDateCalc.setDate(endDateCalc.getDate() - 1);
        break;
      case IntervalValue.Year:
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

    onIntervalChange({
      startDate: startDateCalc,
      endDate: endDateCalc,
      interval: event.target.value as IntervalValue,
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
        {Object.values(IntervalValue).map((interval) => (
          <MenuItem key={interval} value={interval}>
            {interval}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default IntervalSelector;