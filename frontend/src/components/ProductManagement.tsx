import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  Grid,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import BiotechIcon from '@mui/icons-material/Biotech';
import { productsAPI } from '../services/api';
import { ChemicalProduct, ProductFormData } from '../types';
import { useDebounce } from '../hooks/useDebounce';

function ProductManagement(): JSX.Element {
  const [products, setProducts] = useState<ChemicalProduct[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<ChemicalProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searching, setSearching] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ChemicalProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formData, setFormData] = useState<ProductFormData>({
    product_name: '',
    cas_number: '',
    unit_of_measurement: 'KG',
  });

  useEffect(() => {
    let isMounted = true;
    
    const loadProducts = async () => {
      if (isMounted) {
        await fetchProducts();
      }
    };
    
    loadProducts();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim() === '') {
        setDisplayedProducts(products);
        setSearching(false);
        return;
      }

      try {
        setSearching(true);
        setError(null);
        const response = await productsAPI.search(debouncedSearchQuery.trim());
        setDisplayedProducts(response.data);
      } catch (err) {
        setError('Failed to search products. Please try again.');
        console.error('Error searching products:', err);
        setDisplayedProducts(products);
      } finally {
        setSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, products]);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getAll();
      setProducts(response.data);
      setDisplayedProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product: ChemicalProduct | null = null): void => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        product_name: product.product_name,
        cas_number: product.cas_number,
        unit_of_measurement: product.unit_of_measurement,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        product_name: '',
        cas_number: '',
        unit_of_measurement: 'KG',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setEditingProduct(null);
    setFormData({
      product_name: '',
      cas_number: '',
      unit_of_measurement: 'KG',
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, formData);
        setSuccess('Product updated successfully!');
      } else {
        await productsAPI.create(formData);
        setSuccess('Product created successfully!');
      }

      handleCloseDialog();
      await fetchProducts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to save product. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await productsAPI.delete(id);
      setSuccess('Product deleted successfully!');
      await fetchProducts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete product. Please try again.';
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <BiotechIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
            Product Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Product
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search products by name or CAS number..."
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
                    onClick={() => setSearchQuery('')}
                    edge="end"
                    aria-label="clear search"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null}
              </InputAdornment>
            ),
          }}
          helperText={searchQuery ? 'Searching products via API...' : 'Type to search products by name or CAS number'}
        />
      </Box>

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

      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light', '& th': { color: 'white', fontWeight: 600 } }}>
              <TableCell><strong>Product Name</strong></TableCell>
              <TableCell><strong>CAS Number</strong></TableCell>
              <TableCell><strong>Unit</strong></TableCell>
              <TableCell><strong>Current Stock</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {searchQuery ? 'No products found matching your search.' : 'No products found. Click "Add Product" to create one.'}
                </TableCell>
              </TableRow>
            ) : (
              displayedProducts.map((product) => (
                <TableRow 
                  key={product.id} 
                  hover
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      cursor: 'pointer'
                    } 
                  }}
                >
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.cas_number}</TableCell>
                  <TableCell>{product.unit_of_measurement}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {parseFloat((product.current_stock_quantity || 0).toString()).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(product)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(product.id)}
                      size="small"
                      disabled={deleting}
                    >
                      {deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Product Name"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="CAS Number"
                  name="cas_number"
                  value={formData.cas_number}
                  onChange={handleInputChange}
                  required
                  helperText="CAS number must be unique"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Unit of Measurement"
                  name="unit_of_measurement"
                  value={formData.unit_of_measurement}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="KG">KG</MenuItem>
                  <MenuItem value="MT">MT</MenuItem>
                  <MenuItem value="Litre">Litre</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button size="small" onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
            <Button size="small" type="submit" variant="contained" disabled={saving}>
              {saving ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  {editingProduct ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingProduct ? 'Update' : 'Create'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default ProductManagement;

