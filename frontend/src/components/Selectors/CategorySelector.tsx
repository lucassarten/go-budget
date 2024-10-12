import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { ent } from "../../../wailsjs/go/models";

interface CategorySelectorProps {
  // eslint-disable-next-line no-unused-vars
  onCategoryChange: (category: ent.Category) => void;
  categories: ent.Category[];
}

function CategorySelector({
  onCategoryChange,
  categories,
}: CategorySelectorProps) {
  const [selectedOption, setSelectedOption] = useState(categories[0]);
  const handleOptionChange = (event: SelectChangeEvent<ent.Category>) => {
    setSelectedOption(event.target.value as ent.Category);
    onCategoryChange(event.target.value as ent.Category);
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
        value={selectedOption}
        onChange={handleOptionChange}
      >
        {categories.map((category) => (
          // @ts-ignore
          <MenuItem key={category.id} value={category}>
            {category.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default CategorySelector;