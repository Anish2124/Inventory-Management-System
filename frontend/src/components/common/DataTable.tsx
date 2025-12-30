import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

interface Column {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  emptyMessage?: string;
  renderRow: (row: any) => React.ReactNode;
  keyExtractor: (row: any) => string | number;
}

function DataTable({
  columns,
  rows,
  emptyMessage = 'No data available',
  renderRow,
  keyExtractor,
}: DataTableProps): JSX.Element {
  return (
    <TableContainer component={Paper} elevation={2}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light', '& th': { color: 'white', fontWeight: 600 } }}>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                style={{ minWidth: column.minWidth }}
              >
                <strong>{column.label}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer',
                  },
                }}
              >
                {renderRow(row)}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;

