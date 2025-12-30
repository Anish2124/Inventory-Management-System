import { useState, useEffect } from 'react';
import { TextField, InputAdornment, CircularProgress, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void | Promise<void>;
  debounceDelay?: number;
  helperText?: string;
  fullWidth?: boolean;
}

function SearchInput({
  placeholder = 'Search...',
  onSearch,
  debounceDelay = 500,
  helperText,
  fullWidth = true,
}: SearchInputProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim() === '') {
        setSearching(false);
        await onSearch('');
        return;
      }

      try {
        setSearching(true);
        await onSearch(debouncedSearchQuery.trim());
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, onSearch]);

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <TextField
      fullWidth={fullWidth}
      size="small"
      placeholder={placeholder}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {searching ? (
              <CircularProgress size={20} />
            ) : searchQuery ? (
              <IconButton
                size="small"
                onClick={handleClear}
                edge="end"
                aria-label="clear search"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null}
          </InputAdornment>
        ),
      }}
      helperText={searching ? 'Searching...' : (helperText || 'Type to search')}
    />
  );
}

export default SearchInput;

