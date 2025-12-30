import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { inventoryAPI, productsAPI } from '../services/api';
import { ChemicalProduct, StockMovement } from '../types';

function StockUpdate(): JSX.Element {
  const [products, setProducts] = useState<ChemicalProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState<string>('');
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStock, setLoadingStock] = useState<boolean>(false);
  const [loadingMovements, setLoadingMovements] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await Promise.all([fetchProducts(), fetchRecentMovements()]);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductStock();
    } else {
      setCurrentStock(null);
    }
  }, [selectedProduct]);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStock = async (): Promise<void> => {
    try {
      setLoadingStock(true);
      const response = await inventoryAPI.getByProductId(parseInt(selectedProduct));
      setCurrentStock(parseFloat(response.data.current_stock_quantity.toString()));
    } catch (err) {
      console.error('Error fetching product stock:', err);
      setCurrentStock(0);
    } finally {
      setLoadingStock(false);
    }
  };

  const fetchRecentMovements = async (): Promise<void> => {
    try {
      setLoadingMovements(true);
      const response = await inventoryAPI.getAllHistory();
      setRecentMovements(response.data.slice(0, 10));
    } catch (err) {
      console.error('Error fetching recent movements:', err);
    } finally {
      setLoadingMovements(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) {
      setError('Please select a product and enter a valid positive quantity.');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await inventoryAPI.updateStock({
        product_id: parseInt(selectedProduct),
        movement_type: movementType,
        quantity: parseFloat(quantity),
      });

      setSuccess(
        `Stock ${movementType === 'IN' ? 'increased' : 'decreased'} successfully! ` +
        `Previous: ${response.data.previous_stock}, New: ${response.data.new_stock}`
      );

      setQuantity('');
      fetchProductStock();
      fetchRecentMovements();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update stock. Please try again.';
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const selectedProductData = products.find((p) => p.id === parseInt(selectedProduct));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <AssessmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
          Stock Update
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Update Stock
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Select Product"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    required
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id.toString()}>
                        {product.product_name} ({product.cas_number})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {selectedProduct && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Current Stock
                        </Typography>
                        {loadingStock ? (
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Loading...</Typography>
                          </Box>
                        ) : (
                          <Typography variant="h5">
                            {currentStock !== null ? currentStock.toFixed(2) : '0.00'} {selectedProductData?.unit_of_measurement}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Movement Type"
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value as 'IN' | 'OUT')}
                    required
                  >
                    <MenuItem value="IN">IN (Increase Stock)</MenuItem>
                    <MenuItem value="OUT">OUT (Decrease Stock)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Enter a positive number"
                  />
                </Grid>

                {movementType === 'OUT' && currentStock !== null && quantity && (
                  <Grid item xs={12}>
                    <Alert severity={parseFloat(quantity) > currentStock ? 'error' : 'info'}>
                      {parseFloat(quantity) > currentStock
                        ? `Warning: Insufficient stock! Current: ${currentStock.toFixed(2)}, Requested: ${parseFloat(quantity).toFixed(2)}`
                        : `After update: ${(currentStock - parseFloat(quantity)).toFixed(2)} ${selectedProductData?.unit_of_measurement}`}
                    </Alert>
                  </Grid>
                )}

                {movementType === 'IN' && quantity && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      After update: {(currentStock || 0) + parseFloat(quantity)} {selectedProductData?.unit_of_measurement}
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    fullWidth
                    disabled={updating || !selectedProduct || !quantity}
                  >
                    {updating ? <CircularProgress size={20} /> : 'Update Stock'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Recent Stock Movements
            </Typography>
            {loadingMovements ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Product</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Quantity</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentMovements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No recent movements
                        </TableCell>
                      </TableRow>
                    ) : (
                    recentMovements.map((movement) => (
                      <TableRow 
                        key={movement.id}
                        hover
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'action.hover'
                          } 
                        }}
                      >
                        <TableCell>{movement.product_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Typography
                            color={movement.movement_type === 'IN' ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {movement.movement_type}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {parseFloat(movement.quantity.toString()).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {new Date(movement.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default StockUpdate;

