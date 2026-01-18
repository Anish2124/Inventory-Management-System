import { Alert, AlertProps } from '@mui/material';

interface AlertMessageProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  severity?: AlertProps['severity'];
}

function AlertMessage({ 
  message, 
  type, 
  onClose,
  severity 
}: AlertMessageProps): JSX.Element {
  const alertSeverity = severity || type;
  
  return (
    <Alert 
      severity={alertSeverity} 
      onClose={onClose}
      sx={{ mb: 2 }}
    >
      {message}
    </Alert>
  );
}

export default AlertMessage;

