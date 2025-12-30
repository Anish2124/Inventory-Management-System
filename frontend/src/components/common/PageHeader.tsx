import React from 'react';
import { Box, Typography, SvgIconProps } from '@mui/material';

interface PageHeaderProps {
  icon: React.ReactElement<SvgIconProps>;
  title: string;
  action?: React.ReactNode;
}

function PageHeader({ icon, title, action }: PageHeaderProps): JSX.Element {
  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      mb={3} 
      flexWrap="wrap" 
      gap={2}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {React.cloneElement(icon, { sx: { fontSize: 32, color: 'primary.main' } })}
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
          {title}
        </Typography>
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}

export default PageHeader;

