import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { db } from "../../../wailsjs/go/models";

interface CategorySelectorProps {
  // eslint-disable-next-line no-unused-vars
  onCategoryChange: (category: db.Category) => void;
  categories: db.Category[];
}

function CategorySelector({
  onCategoryChange,
  categories,
}: CategorySelectorProps) {
  const [selectedOption, setSelectedOption] = useState(categories[0]);
  const handleOptionChange = (event: SelectChangeEvent<db.Category>) => {
    setSelectedOption(event.target.value as db.Category);
    onCategoryChange(event.target.value as db.Category);
  };

  useEffect(() => {
    setSelectedOption(categories[0]);
  }, [categories]);

  return (
    <FormControl>
      <InputLabel id="category-selector-label">Category</InputLabel>
      <Select
        displayEmpty
        labelId="category-selector-label"
        className="category-selector"
        id="CategorySelector"
        label="Category"
        // @ts-ignore
        value={selectedOption}
        onChange={handleOptionChange}
      >
        {categories.map((category) => (
          // @ts-ignore
          <MenuItem key={category.name} value={category}>
            {category.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default CategorySelector;