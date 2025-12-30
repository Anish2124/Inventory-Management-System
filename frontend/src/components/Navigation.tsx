import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';

function Navigation(): JSX.Element {
  const location = useLocation();

  const getTabValue = (): number => {
    if (location.pathname === '/products') return 1;
    if (location.pathname === '/stock-update') return 2;
    return 0;
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Tabs value={getTabValue()} aria-label="navigation tabs" size="small">
        <Tab label="Inventory List" component={Link} to="/" />
        <Tab label="Product Management" component={Link} to="/products" />
        <Tab label="Stock Update" component={Link} to="/stock-update" />
      </Tabs>
    </Box>
  );
}

export default Navigation;

