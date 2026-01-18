import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
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
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { inventoryAPI, productsAPI } from '../services/api';
import { ChemicalProduct } from '../types';

function StockUpdate(): JSX.Element {
  const [products, setProducts] = useState<ChemicalProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!selectedProduct || !quantity || Number(quantity) <= 0) {
      setError('Please select a product and enter a valid quantity.');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      await inventoryAPI.updateStock({
        product_id: Number(selectedProduct),
        movement_type: movementType,
        quantity: Number(quantity),
      });

      setSuccess(
        `Stock ${movementType === 'IN' ? 'increased' : 'decreased'} successfully`
      );
      setQuantity('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update stock.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <AssessmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4">Stock Update</Typography>
      </Box>

      <Paper sx={{ p: 3 }} elevation={2}>
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
                select
                label="Select Product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                required
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.product_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Movement Type"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as 'IN' | 'OUT')}
              >
                <MenuItem value="IN">IN (Increase)</MenuItem>
                <MenuItem value="OUT">OUT (Decrease)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setQuantity(e.target.value)
                }
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={updating}
              >
                {updating ? <CircularProgress size={20} /> : 'Update Stock'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default StockUpdate;
