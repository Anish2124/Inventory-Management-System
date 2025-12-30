import { useState, useEffect } from "react";
import { TableCell, Box, Chip } from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { inventoryAPI, productsAPI } from "../services/api";
import { InventoryItem } from "../types";
import {
  LoadingSpinner,
  AlertMessage,
  PageHeader,
  DataTable,
  SearchInput,
} from "./common";

function InventoryList(): JSX.Element {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = async (query: string) => {
    if (query.trim() === "") {
      setFilteredInventory(inventory);
      setSearchQuery("");
      return;
    }

    try {
      setError(null);
      setSearchQuery(query);
      const response = await productsAPI.search(query.trim());
      const searchedProductNames = new Set(
        response.data.map((p) => p.product_name.toLowerCase())
      );
      const searchedCASNumbers = new Set(
        response.data.map((p) => p.cas_number.toLowerCase())
      );

      // Filter inventory to show only searched products (match by name or CAS number)
      const filtered = inventory.filter(
        (item) =>
          searchedProductNames.has(item.product_name.toLowerCase()) ||
          searchedCASNumbers.has(item.cas_number.toLowerCase())
      );
      setFilteredInventory(filtered);
    } catch (err) {
      setError("Failed to search products. Please try again.");
      console.error("Error searching products:", err);
      setFilteredInventory(inventory);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInventory = async () => {
      if (isMounted) {
        await fetchInventory();
      }
    };

    loadInventory();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchInventory = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryAPI.getAll();
      setInventory(response.data);
      setFilteredInventory(response.data);
    } catch (err) {
      setError("Failed to fetch inventory. Please try again.");
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number | string): JSX.Element => {
    const stockValue = typeof stock === "string" ? parseFloat(stock) : stock;
    if (stockValue === 0) {
      return <Chip label="Out of Stock" color="error" size="small" />;
    } else if (stockValue < 10) {
      return <Chip label="Low Stock" color="warning" size="small" />;
    }
    return <Chip label="In Stock" color="success" size="small" />;
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading inventory..." />;
  }

  const columns = [
    { id: "product_name", label: "Product Name", minWidth: 200 },
    { id: "cas_number", label: "CAS Number", minWidth: 150 },
    {
      id: "current_stock",
      label: "Current Stock",
      minWidth: 120,
      align: "right" as const,
    },
    { id: "unit", label: "Unit", minWidth: 100 },
    { id: "status", label: "Status", minWidth: 120 },
  ];

  return (
    <Box>
      <PageHeader icon={<Inventory2Icon />} title="Inventory List" />

      <Box sx={{ mb: 3 }}>
        <SearchInput
          placeholder="Search by product name or CAS number..."
          onSearch={handleSearch}
          helperText="Type to search products by name or CAS number"
        />
      </Box>

      {error && (
        <AlertMessage
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}

      <DataTable
        columns={columns}
        rows={filteredInventory}
        emptyMessage={
          searchQuery
            ? "No products found matching your search."
            : "No products in inventory."
        }
        keyExtractor={(item) => item.id}
        renderRow={(item) => (
          <>
            <TableCell>{item.product_name}</TableCell>
            <TableCell>{item.cas_number}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 500 }}>
              {parseFloat(item.current_stock_quantity.toString()).toFixed(2)}
            </TableCell>
            <TableCell>{item.unit_of_measurement}</TableCell>
            <TableCell>{getStockStatus(item.current_stock_quantity)}</TableCell>
          </>
        )}
      />
    </Box>
  );
}

export default InventoryList;
