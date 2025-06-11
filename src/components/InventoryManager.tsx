import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Fab,
  Badge,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  ShoppingCart as PurchaseIcon,
  Receipt as ReceiptIcon,
  Build as RecipeIcon,
  TrendingUp as AdjustmentIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InventoryManager: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [inventorySummary, setInventorySummary] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info' | 'warning'; texto: string } | null>(null);

  // Estados para diálogos
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openMovementDialog, setOpenMovementDialog] = useState(false);
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState(false);
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
  const [openVendorDialog, setOpenVendorDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Estados para autocompletado y datos auxiliares
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [availableVendors, setAvailableVendors] = useState<any[]>([]);
  const [unitOfMeasures, setUnitOfMeasures] = useState<string[]>([
    'UND', 'LB', 'LT', 'KG', 'GR', 'ONZ', 'GAL', 'ML', 'CAJA', 'DOCENA', 'MANO', 'HORA', 'METRO', 'CM'
  ]);
  const [loadingItemSuggestions, setLoadingItemSuggestions] = useState(false);

  // Estados para filtros y búsqueda
  const [searchFilters, setSearchFilters] = useState({
    items: '',
    inventory: '',
    movements: '',
    purchaseOrders: '',
    recipes: '',
    vendors: ''
  });

  // Estados para formularios
  const [itemForm, setItemForm] = useState({
    no: '',
    description: '',
    description2: '',
    type: 'Inventory',
    baseUnitOfMeasure: 'PCS',
    unitPrice: '',
    unitCost: '',
    costingMethod: 'Average',
    reorderPoint: '',
    maximumInventory: '',
    minimumOrderQty: '',
    safetyStockQty: ''
  });

  const [vendorForm, setVendorForm] = useState({
    no: '',
    name: '',
    address: '',
    city: '',
    contact: '',
    phoneNo: '',
    email: '',
    currencyCode: 'HNL',
    paymentTermsCode: '',
    blocked: ''
  });

  const [movementForm, setMovementForm] = useState({
    type: 'adjustment-positive',
    itemNo: '',
    quantity: '',
    unitCost: '',
    reasonCode: 'AJUSTE',
    description: ''
  });

  const [purchaseForm, setPurchaseForm] = useState({
    vendorNo: 'VENDOR001',
    orderDate: new Date().toISOString().split('T')[0],
    expectedReceiptDate: '',
    lines: [
      {
        itemNo: '',
        quantity: '',
        directUnitCost: '',
        description: '',
        locationCode: 'MAIN',
        lineDiscountPct: '',
        vatPct: 15 // ISV por defecto en Honduras
      }
    ]
  });

  const [recipeForm, setRecipeForm] = useState({
    parentItemNo: '',
    components: [
      {
        componentItemNo: '',
        quantityPer: '',
        unitCost: '',
        description: '',
        scrapPct: ''
      }
    ]
  });

  useEffect(() => {
    loadData();
    // Cargar datos auxiliares solo una vez al montar el componente
    if (availableItems.length === 0) {
      loadAvailableItems();
    }
    if (availableVendors.length === 0) {
      loadAvailableVendors();
    }
  }, [tabValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true);
    try {
      switch (tabValue) {
        case 0: // Artículos
          await loadItems();
          break;
        case 1: // Inventario
          await loadInventorySummary();
          break;
        case 2: // Movimientos
          await loadMovements();
          break;
        case 3: // Órdenes de Compra
          await loadPurchaseOrders();
          break;
        case 4: // Recetas
          await loadRecipes();
          break;
        case 5: // Proveedores
          await loadVendors();
          break;
      }
    } catch (error) {
      mostrarMensaje('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    const response = await fetch('/api/inventory/items');
    const data = await response.json();
    if (data.success) {
      setItems(data.data);
    }
  };

  const loadInventorySummary = async () => {
    const response = await fetch('/api/inventory/items?summary=true');
    const data = await response.json();
    if (data.success) {
      setInventorySummary(data.data);
    }
  };

  const loadMovements = async () => {
    const response = await fetch('/api/inventory/movements');
    const data = await response.json();
    if (data.success) {
      setMovements(data.data);
    }
  };

  const loadPurchaseOrders = async () => {
    const response = await fetch('/api/inventory/purchase-orders');
    const data = await response.json();
    if (data.success) {
      setPurchaseOrders(data.data);
    }
  };

  const loadRecipes = async () => {
    const response = await fetch('/api/inventory/recipes');
    const data = await response.json();
    if (data.success) {
      setRecipes(data.data);
    }
  };

  const loadVendors = async () => {
    const response = await fetch('/api/inventory/vendors');
    const data = await response.json();
    if (data.success) {
      setVendors(data.data);
    }
  };

  // Funciones para autocompletado y datos auxiliares
  const loadAvailableItems = async () => {
    try {
      const response = await fetch('/api/inventory/items');
      const data = await response.json();
      if (data.success) {
        setAvailableItems(data.data.map((item: any) => ({
          ...item,
          label: `${item.no} - ${item.description}`,
          value: item.no
        })));
      }
    } catch (error) {
      console.error('Error cargando artículos:', error);
    }
  };

  const loadAvailableVendors = async () => {
    try {
      const response = await fetch('/api/inventory/vendors');
      const data = await response.json();
      if (data.success) {
        setAvailableVendors(data.data.map((vendor: any) => ({
          ...vendor,
          label: `${vendor.no} - ${vendor.name}`,
          value: vendor.no
        })));
      }
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const getItemCost = async (itemNo: string) => {
    try {
      const response = await fetch(`/api/inventory/items/${itemNo}/cost`);
      const data = await response.json();
      if (data.success) {
        return data.data.unitCost || 0;
      }
    } catch (error) {
      console.error('Error obteniendo costo:', error);
    }
    return 0;
  };

  const getItemDetails = async (itemNo: string) => {
    try {
      const response = await fetch(`/api/inventory/items/${itemNo}`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
    } catch (error) {
      console.error('Error obteniendo detalles:', error);
    }
    return null;
  };

  // Funciones de filtrado
  const getFilteredItems = () => {
    if (!searchFilters.items) return items;
    return items.filter(item => 
      item.no.toLowerCase().includes(searchFilters.items.toLowerCase()) ||
      item.description.toLowerCase().includes(searchFilters.items.toLowerCase()) ||
      item.type.toLowerCase().includes(searchFilters.items.toLowerCase())
    );
  };

  const getFilteredInventory = () => {
    if (!searchFilters.inventory) return inventorySummary;
    return inventorySummary.filter(item => 
      item.itemNo.toLowerCase().includes(searchFilters.inventory.toLowerCase()) ||
      item.description.toLowerCase().includes(searchFilters.inventory.toLowerCase())
    );
  };

  const getFilteredMovements = () => {
    if (!searchFilters.movements) return movements;
    return movements.filter(movement => 
      movement.itemNo.toLowerCase().includes(searchFilters.movements.toLowerCase()) ||
      movement.entryType.toLowerCase().includes(searchFilters.movements.toLowerCase()) ||
      movement.documentNo.toLowerCase().includes(searchFilters.movements.toLowerCase()) ||
      movement.description.toLowerCase().includes(searchFilters.movements.toLowerCase())
    );
  };

  const getFilteredPurchaseOrders = () => {
    if (!searchFilters.purchaseOrders) return purchaseOrders;
    return purchaseOrders.filter(order => 
      order.no.toLowerCase().includes(searchFilters.purchaseOrders.toLowerCase()) ||
      order.buyFromVendorName.toLowerCase().includes(searchFilters.purchaseOrders.toLowerCase()) ||
      order.status.toLowerCase().includes(searchFilters.purchaseOrders.toLowerCase())
    );
  };

  const getFilteredRecipes = () => {
    if (!searchFilters.recipes) return recipes;
    return recipes.filter(recipe => 
      recipe.parentItemNo.toLowerCase().includes(searchFilters.recipes.toLowerCase()) ||
      recipe.parentItemDescription.toLowerCase().includes(searchFilters.recipes.toLowerCase())
    );
  };

  const mostrarMensaje = (tipo: 'success' | 'error' | 'info' | 'warning', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const handleCreateItem = async () => {
    try {
      const response = await fetch('/api/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemForm)
      });

      const data = await response.json();
      
      if (data.success) {
        mostrarMensaje('success', data.message);
        setOpenItemDialog(false);
        loadItems();
        resetItemForm();
      } else {
        mostrarMensaje('error', data.message);
      }
    } catch (error) {
      mostrarMensaje('error', 'Error al crear artículo');
    }
  };

  const handleCreateMovement = async () => {
    try {
      const response = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movementForm)
      });

      const data = await response.json();
      
      if (data.success) {
        mostrarMensaje('success', data.message);
        setOpenMovementDialog(false);
        loadMovements();
        loadInventorySummary();
        resetMovementForm();
      } else {
        mostrarMensaje('error', data.message);
      }
    } catch (error) {
      mostrarMensaje('error', 'Error al crear movimiento');
    }
  };

  const handleCreatePurchaseOrder = async () => {
    try {
      const response = await fetch('/api/inventory/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseForm)
      });

      const data = await response.json();
      
      if (data.success) {
        mostrarMensaje('success', data.message);
        setOpenPurchaseDialog(false);
        loadPurchaseOrders();
        resetPurchaseForm();
      } else {
        mostrarMensaje('error', data.message);
      }
    } catch (error) {
      mostrarMensaje('error', 'Error al crear orden de compra');
    }
  };

  const handleCreateRecipe = async () => {
    try {
      const response = await fetch('/api/inventory/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeForm)
      });

      const data = await response.json();
      
      if (data.success) {
        mostrarMensaje('success', data.message);
        setOpenRecipeDialog(false);
        loadRecipes();
        resetRecipeForm();
      } else {
        mostrarMensaje('error', data.message);
      }
    } catch (error) {
      mostrarMensaje('error', 'Error al crear receta');
    }
  };

  const handleCreateVendor = async () => {
    try {
      const response = await fetch('/api/inventory/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorForm)
      });

      const data = await response.json();
      
      if (data.success) {
        mostrarMensaje('success', data.message);
        setOpenVendorDialog(false);
        loadVendors();
        loadAvailableVendors(); // Actualizar lista para autocompletado
        resetVendorForm();
      } else {
        mostrarMensaje('error', data.message);
      }
    } catch (error) {
      mostrarMensaje('error', 'Error al crear proveedor');
    }
  };

  const handleExportMovements = async () => {
    try {
      const response = await fetch('/api/inventory/movements?export=true');
      const data = await response.json();
      
      if (data.success) {
        // Crear archivo Excel
        const csvContent = convertToCSV(data.data);
        downloadCSV(csvContent, 'movimientos_inventario.csv');
        mostrarMensaje('success', 'Movimientos exportados exitosamente');
      }
    } catch (error) {
      mostrarMensaje('error', 'Error al exportar movimientos');
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetItemForm = () => {
    setItemForm({
      no: '',
      description: '',
      description2: '',
      type: 'Inventory',
      baseUnitOfMeasure: 'PCS',
      unitPrice: '',
      unitCost: '',
      costingMethod: 'Average',
      reorderPoint: '',
      maximumInventory: '',
      minimumOrderQty: '',
      safetyStockQty: ''
    });
  };

  const resetMovementForm = () => {
    setMovementForm({
      type: 'adjustment-positive',
      itemNo: '',
      quantity: '',
      unitCost: '',
      reasonCode: 'AJUSTE',
      description: ''
    });
  };

  const resetPurchaseForm = () => {
    setPurchaseForm({
      vendorNo: 'VENDOR001',
      orderDate: new Date().toISOString().split('T')[0],
      expectedReceiptDate: '',
      lines: [
        {
          itemNo: '',
          quantity: '',
          directUnitCost: '',
          description: '',
          locationCode: 'MAIN',
          lineDiscountPct: '',
          vatPct: 15 // ISV por defecto en Honduras
        }
      ]
    });
  };

  const resetRecipeForm = () => {
    setRecipeForm({
      parentItemNo: '',
      components: [
        {
          componentItemNo: '',
          quantityPer: '',
          unitCost: '',
          description: '',
          scrapPct: ''
        }
      ]
    });
  };

  const resetVendorForm = () => {
    setVendorForm({
      no: '',
      name: '',
      address: '',
      city: '',
      contact: '',
      phoneNo: '',
      email: '',
      currencyCode: 'HNL',
      paymentTermsCode: '',
      blocked: ''
    });
  };

  const addPurchaseLine = () => {
    setPurchaseForm({
      ...purchaseForm,
      lines: [
        ...purchaseForm.lines,
        {
          itemNo: '',
          quantity: '',
          directUnitCost: '',
          description: '',
          locationCode: 'MAIN',
          lineDiscountPct: '',
          vatPct: 15 // ISV por defecto en Honduras
        }
      ]
    });
  };

  const addRecipeComponent = () => {
    setRecipeForm({
      ...recipeForm,
      components: [
        ...recipeForm.components,
        {
          componentItemNo: '',
          quantityPer: '',
          unitCost: '',
          description: '',
          scrapPct: ''
        }
      ]
    });
  };

  const getInventoryStatusColor = (item: any) => {
    if (item.needsReorder) return 'error';
    if (item.quantity <= item.reorderPoint * 1.5) return 'warning';
    return 'success';
  };

  // Funciones de cálculo para órdenes de compra
  const calculateLineAmount = (line: any) => {
    const quantity = parseFloat(line.quantity) || 0;
    const directUnitCost = parseFloat(line.directUnitCost) || 0;
    const lineDiscountPct = parseFloat(line.lineDiscountPct) || 0;
    
    const baseAmount = quantity * directUnitCost;
    const discountAmount = baseAmount * (lineDiscountPct / 100);
    return baseAmount - discountAmount;
  };

  const calculateLineVAT = (line: any) => {
    const lineAmount = calculateLineAmount(line);
    const vatPct = parseFloat(line.vatPct) || 0;
    return lineAmount * (vatPct / 100);
  };

  const calculateLineTotalWithVAT = (line: any) => {
    const lineAmount = calculateLineAmount(line);
    return lineAmount + calculateLineVAT(line);
  };

  const calculatePurchaseOrderTotals = () => {
    const subtotal = purchaseForm.lines.reduce((sum, line) => sum + calculateLineAmount(line), 0);
    const totalDiscount = purchaseForm.lines.reduce((sum, line) => {
      const quantity = parseFloat(line.quantity) || 0;
      const directUnitCost = parseFloat(line.directUnitCost) || 0;
      const lineDiscountPct = parseFloat(line.lineDiscountPct) || 0;
      const baseAmount = quantity * directUnitCost;
      return sum + (baseAmount * (lineDiscountPct / 100));
    }, 0);
    const totalVAT = purchaseForm.lines.reduce((sum, line) => sum + calculateLineVAT(line), 0);
    const total = subtotal + totalVAT;

    return {
      subtotal,
      totalDiscount,
      totalVAT,
      total
    };
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <InventoryIcon />
        Gestión de Inventario
      </Typography>

      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mb: 2 }}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Estadísticas rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {items.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Artículos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {inventorySummary.filter(item => item.needsReorder).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Requieren Reorden
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {purchaseOrders.filter(po => po.status === 'Open').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                OC Abiertas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {recipes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recetas Activas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Artículos" icon={<InventoryIcon />} />
          <Tab label="Inventario" icon={<Badge badgeContent={inventorySummary.filter(item => item.needsReorder).length} color="error"><InventoryIcon /></Badge>} />
          <Tab label="Movimientos" icon={<ReceiptIcon />} />
          <Tab label="Órdenes de Compra" icon={<PurchaseIcon />} />
          <Tab label="Recetas (BOM)" icon={<RecipeIcon />} />
          <Tab label="Proveedores" icon={<InventoryIcon />} />
        </Tabs>

        {/* Tab 0: Artículos */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Catálogo de Artículos</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {setSelectedItem(null); resetItemForm(); setOpenItemDialog(true);}}
            >
              Nuevo Artículo
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar artículos por número, descripción o tipo..."
              value={searchFilters.items}
              onChange={(e) => setSearchFilters({ ...searchFilters, items: e.target.value })}
              InputProps={{
                startAdornment: <Box sx={{ mr: 1 }}>🔍</Box>
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No.</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>UM Base</TableCell>
                  <TableCell>Precio Unitario</TableCell>
                  <TableCell>Costo Unitario</TableCell>
                  <TableCell>Método Costo</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredItems().map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.no}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.type} 
                        size="small" 
                        color={item.type === 'Inventory' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{item.baseUnitOfMeasure}</TableCell>
                    <TableCell>L{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>L{item.unitCost.toFixed(2)}</TableCell>
                    <TableCell>{item.costingMethod}</TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedItem(item);
                            setItemForm({
                              no: item.no,
                              description: item.description,
                              description2: item.description2 || '',
                              type: item.type,
                              baseUnitOfMeasure: item.baseUnitOfMeasure,
                              unitPrice: item.unitPrice,
                              unitCost: item.unitCost,
                              costingMethod: item.costingMethod,
                              reorderPoint: item.reorderPoint,
                              maximumInventory: item.maximumInventory,
                              minimumOrderQty: item.minimumOrderQty,
                              safetyStockQty: item.safetyStockQty
                            });
                            setOpenItemDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 1: Inventario */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Resumen de Inventario</Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadInventorySummary}
                sx={{ mr: 1 }}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                startIcon={<AdjustmentIcon />}
                onClick={() => setOpenMovementDialog(true)}
              >
                Ajuste de Inventario
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por artículo o descripción..."
              value={searchFilters.inventory}
              onChange={(e) => setSearchFilters({ ...searchFilters, inventory: e.target.value })}
              InputProps={{
                startAdornment: <Box sx={{ mr: 1 }}>🔍</Box>
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No. Artículo</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Costo Unitario</TableCell>
                  <TableCell>Valor Total</TableCell>
                  <TableCell>Punto Reorden</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredInventory().map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.itemNo}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>L{item.unitCost.toFixed(2)}</TableCell>
                    <TableCell>L{item.totalValue.toFixed(2)}</TableCell>
                    <TableCell>{item.reorderPoint}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.needsReorder ? 'Reordenar' : 'OK'}
                        color={getInventoryStatusColor(item)}
                        size="small"
                        icon={item.needsReorder ? <WarningIcon /> : undefined}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 2: Movimientos */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Movimientos de Inventario</Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportMovements}
                sx={{ mr: 1 }}
              >
                Exportar BC
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenMovementDialog(true)}
              >
                Nuevo Movimiento
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por artículo, tipo, documento o descripción..."
              value={searchFilters.movements}
              onChange={(e) => setSearchFilters({ ...searchFilters, movements: e.target.value })}
              InputProps={{
                startAdornment: <Box sx={{ mr: 1 }}>🔍</Box>
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>No. Artículo</TableCell>
                  <TableCell>Tipo Movimiento</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Costo</TableCell>
                  <TableCell>No. Documento</TableCell>
                  <TableCell>Descripción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredMovements().map((movement) => (
                  <TableRow key={movement.entryNo}>
                    <TableCell>{new Date(movement.postingDate).toLocaleDateString()}</TableCell>
                    <TableCell>{movement.itemNo}</TableCell>
                    <TableCell>
                      <Chip 
                        label={movement.entryType} 
                        size="small"
                        color={movement.entryType.includes('Positive') ? 'success' : 
                               movement.entryType.includes('Negative') ? 'error' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>L{movement.costAmountActual.toFixed(2)}</TableCell>
                    <TableCell>{movement.documentNo}</TableCell>
                    <TableCell>{movement.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 3: Órdenes de Compra */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Órdenes de Compra</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenPurchaseDialog(true)}
            >
              Nueva Orden
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por documento, proveedor o estado..."
              value={searchFilters.purchaseOrders}
              onChange={(e) => setSearchFilters({ ...searchFilters, purchaseOrders: e.target.value })}
              InputProps={{
                startAdornment: <Box sx={{ mr: 1 }}>🔍</Box>
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No. Documento</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Fecha Orden</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Total c/ISV</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredPurchaseOrders().map((order) => (
                  <TableRow key={order.no}>
                    <TableCell>{order.no}</TableCell>
                    <TableCell>{order.buyFromVendorName}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        size="small"
                        color={order.status === 'Open' ? 'warning' : 
                               order.status === 'Released' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>L{(order.amountIncludingVAT || order.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Tooltip title="Ver Detalles">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            // TODO: Cargar datos de la orden y abrir diálogo de edición
                            setSelectedItem(order);
                            setOpenPurchaseDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 4: Recetas */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Recetas (BOM)</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenRecipeDialog(true)}
            >
              Nueva Receta
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por artículo padre o descripción..."
              value={searchFilters.recipes}
              onChange={(e) => setSearchFilters({ ...searchFilters, recipes: e.target.value })}
              InputProps={{
                startAdornment: <Box sx={{ mr: 1 }}>🔍</Box>
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Artículo Padre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Componentes</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredRecipes().map((recipe) => (
                  <TableRow key={recipe.parentItemNo}>
                    <TableCell>{recipe.parentItemNo}</TableCell>
                    <TableCell>{recipe.parentItemDescription}</TableCell>
                    <TableCell>
                      <Chip label={`${recipe.componentCount} componentes`} size="small" />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver/Editar">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            // TODO: Cargar datos de la receta y abrir diálogo de edición
                            setSelectedItem(recipe);
                            setOpenRecipeDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => {
                            // TODO: Implementar eliminación de receta
                            if (window.confirm(`¿Está seguro de eliminar la receta para ${recipe.parentItemNo}?`)) {
                              // handleDeleteRecipe(recipe.parentItemNo);
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 5: Proveedores */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Proveedores</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenVendorDialog(true)}
            >
              Nuevo Proveedor
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre o número de proveedor..."
              value={searchFilters.vendors}
              onChange={(e) => setSearchFilters({ ...searchFilters, vendors: e.target.value })}
              InputProps={{
                startAdornment: <Box sx={{ mr: 1 }}>🔍</Box>
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No. Proveedor</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.no}>
                    <TableCell>{vendor.no}</TableCell>
                    <TableCell>{vendor.name}</TableCell>
                    <TableCell>
                      <Tooltip title="Ver Detalles">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            // TODO: Cargar datos del proveedor y abrir diálogo de edición
                            setSelectedItem(vendor);
                            setOpenVendorDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Diálogo para crear/editar artículo */}
      <Dialog open={openItemDialog} onClose={() => {setOpenItemDialog(false); setSelectedItem(null); resetItemForm();}} maxWidth="md" fullWidth>
        <DialogTitle>{selectedItem ? `Editar Artículo ${selectedItem.no}` : 'Nuevo Artículo'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="No. Artículo"
                value={itemForm.no}
                onChange={(e) => setItemForm({ ...itemForm, no: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={itemForm.type}
                  onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
                  label="Tipo"
                >
                  <MenuItem value="Inventory">Inventario</MenuItem>
                  <MenuItem value="Non-Inventory">No Inventario</MenuItem>
                  <MenuItem value="Service">Servicio</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>UM Base</InputLabel>
                <Select
                  value={itemForm.baseUnitOfMeasure}
                  onChange={(e) => setItemForm({ ...itemForm, baseUnitOfMeasure: e.target.value })}
                >
                  {unitOfMeasures.map((measure) => (
                    <MenuItem key={measure} value={measure}>
                      {measure}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Método Costo</InputLabel>
                <Select
                  value={itemForm.costingMethod}
                  onChange={(e) => setItemForm({ ...itemForm, costingMethod: e.target.value })}
                  label="Método Costo"
                >
                  <MenuItem value="Average">Promedio</MenuItem>
                  <MenuItem value="FIFO">FIFO</MenuItem>
                  <MenuItem value="LIFO">LIFO</MenuItem>
                  <MenuItem value="Standard">Estándar</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio Unitario"
                type="number"
                value={itemForm.unitPrice}
                placeholder="0.00"
                onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })}
                inputProps={{ 
                  step: 0.01, 
                  min: 0,
                  inputMode: 'decimal'
                }}
                sx={{
                  '& input[type=number]': {
                    MozAppearance: 'textfield'
                  },
                  '& input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0
                  },
                  '& input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Costo Unitario"
                type="number"
                value={itemForm.unitCost}
                placeholder="0.00"
                onChange={(e) => setItemForm({ ...itemForm, unitCost: e.target.value })}
                inputProps={{ 
                  step: 0.01, 
                  min: 0,
                  inputMode: 'decimal'
                }}
                sx={{
                  '& input[type=number]': {
                    MozAppearance: 'textfield'
                  },
                  '& input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0
                  },
                  '& input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Punto de Reorden"
                type="number"
                value={itemForm.reorderPoint}
                placeholder="0.00"
                onChange={(e) => setItemForm({ ...itemForm, reorderPoint: e.target.value })}
                inputProps={{ 
                  step: 0.01, 
                  min: 0,
                  inputMode: 'decimal'
                }}
                sx={{
                  '& input[type=number]': {
                    MozAppearance: 'textfield'
                  },
                  '& input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0
                  },
                  '& input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Inventario Máximo"
                type="number"
                value={itemForm.maximumInventory}
                placeholder="0.00"
                onChange={(e) => setItemForm({ ...itemForm, maximumInventory: e.target.value })}
                inputProps={{ 
                  step: 0.01, 
                  min: 0,
                  inputMode: 'decimal'
                }}
                sx={{
                  '& input[type=number]': {
                    MozAppearance: 'textfield'
                  },
                  '& input[type=number]::-webkit-outer-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0
                  },
                  '& input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setOpenItemDialog(false); setSelectedItem(null); resetItemForm();}}>Cancelar</Button>
          <Button onClick={handleCreateItem} variant="contained">{selectedItem ? 'Actualizar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para movimientos de inventario */}
      <Dialog open={openMovementDialog} onClose={() => setOpenMovementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Movimiento de Inventario</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Movimiento</InputLabel>
                <Select
                  value={movementForm.type}
                  onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value })}
                  label="Tipo de Movimiento"
                >
                  <MenuItem value="adjustment-positive">Ajuste Positivo</MenuItem>
                  <MenuItem value="adjustment-negative">Ajuste Negativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="No. Artículo"
                value={movementForm.itemNo}
                onChange={(e) => setMovementForm({ ...movementForm, itemNo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={movementForm.quantity}
                onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                inputProps={{ 
                  step: 0.01, 
                  min: 0,
                  inputMode: 'decimal'
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Costo Unitario"
                type="number"
                value={movementForm.unitCost}
                onChange={(e) => setMovementForm({ ...movementForm, unitCost: parseFloat(e.target.value) || 0 })}
                disabled={movementForm.type === 'adjustment-negative'}
                inputProps={{ 
                  step: 0.01, 
                  min: 0,
                  inputMode: 'decimal'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Código Razón"
                value={movementForm.reasonCode}
                onChange={(e) => setMovementForm({ ...movementForm, reasonCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={2}
                value={movementForm.description}
                onChange={(e) => setMovementForm({ ...movementForm, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMovementDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateMovement} variant="contained">Crear</Button>
        </DialogActions>
      </Dialog>

      {/* FAB para acciones rápidas */}
      {/* Diálogo para acciones rápidas */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          switch (tabValue) {
            case 0: setOpenItemDialog(true); break;
            case 1: setOpenMovementDialog(true); break;
            case 2: setOpenMovementDialog(true); break;
            case 3: setOpenPurchaseDialog(true); break;
            case 4: setOpenRecipeDialog(true); break;
            case 5: setOpenVendorDialog(true); break;
          }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Diálogo para crear/editar recetas */}
      <Dialog open={openRecipeDialog} onClose={() => setOpenRecipeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Editar Receta' : 'Crear Nueva Receta'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Autocomplete
              options={availableItems}
              getOptionLabel={(option) => option.label || ''}
              value={availableItems.find(item => item.value === recipeForm.parentItemNo) || null}
              onChange={(_, newValue) => {
                setRecipeForm({ 
                  ...recipeForm, 
                  parentItemNo: newValue?.value || '' 
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Artículo Padre"
                  required
                  helperText="Seleccione el artículo que se fabricará con esta receta"
                />
              )}
            />

            <Typography variant="h6" sx={{ mt: 2 }}>
              Componentes de la Receta
            </Typography>

            {recipeForm.components.map((component, index) => (
              <Paper key={index} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="subtitle2">
                    Componente {index + 1}
                  </Typography>
                  {recipeForm.components.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newComponents = recipeForm.components.filter((_, i) => i !== index);
                        setRecipeForm({ ...recipeForm, components: newComponents });
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={availableItems}
                      getOptionLabel={(option) => option.label || ''}
                      value={availableItems.find(item => item.value === component.componentItemNo) || null}
                      onChange={async (_, newValue) => {
                        const newComponents = [...recipeForm.components];
                        newComponents[index].componentItemNo = newValue?.value || '';
                        
                        if (newValue?.value) {
                          const itemDetails = await getItemDetails(newValue.value);
                          if (itemDetails) {
                            newComponents[index].description = itemDetails.description;
                            newComponents[index].unitCost = itemDetails.unitCost || 0;
                          }
                        }
                        
                        setRecipeForm({ ...recipeForm, components: newComponents });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Artículo"
                          required
                          size="small"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Cantidad por Unidad"
                      type="number"
                      value={component.quantityPer}
                      onChange={(e) => {
                        const newComponents = [...recipeForm.components];
                        newComponents[index].quantityPer = e.target.value;
                        setRecipeForm({ ...recipeForm, components: newComponents });
                      }}
                      inputProps={{ 
                        step: 0.001, 
                        min: 0 
                      }}
                      size="small"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Costo Unitario"
                      type="number"
                      value={component.unitCost}
                      onChange={(e) => {
                        const newComponents = [...recipeForm.components];
                        newComponents[index].unitCost = e.target.value;
                        setRecipeForm({ ...recipeForm, components: newComponents });
                      }}
                      inputProps={{ 
                        step: 0.01, 
                        min: 0 
                      }}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <TextField
                      label="% Desperdicio"
                      type="number"
                      value={component.scrapPct}
                      onChange={(e) => {
                        const newComponents = [...recipeForm.components];
                        newComponents[index].scrapPct = e.target.value;
                        setRecipeForm({ ...recipeForm, components: newComponents });
                      }}
                      inputProps={{ 
                        step: 0.1, 
                        min: 0,
                        max: 100 
                      }}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">
                      Costo Total: L{((parseFloat(component.quantityPer) || 0) * (parseFloat(component.unitCost) || 0) * (1 + (parseFloat(component.scrapPct) || 0) / 100)).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addRecipeComponent}
              sx={{ alignSelf: 'flex-start' }}
            >
              Agregar Componente
            </Button>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Resumen de la Receta
            </Typography>
            <Typography variant="body2">
              Costo Total Estimado: L{recipeForm.components.reduce((total, comp) => {
                const quantity = parseFloat(comp.quantityPer) || 0;
                const cost = parseFloat(comp.unitCost) || 0;
                const scrap = parseFloat(comp.scrapPct) || 0;
                return total + (quantity * cost * (1 + scrap / 100));
              }, 0).toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRecipeDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateRecipe}
            variant="contained"
            disabled={!recipeForm.parentItemNo || recipeForm.components.some(c => !c.componentItemNo || !c.quantityPer)}
          >
            {selectedItem ? 'Actualizar' : 'Crear'} Receta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para crear/editar proveedores */}
      <Dialog open={openVendorDialog} onClose={() => setOpenVendorDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Editar Proveedor' : 'Crear Nuevo Proveedor'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Código de Proveedor"
                  value={vendorForm.no}
                  onChange={(e) => setVendorForm({ ...vendorForm, no: e.target.value.toUpperCase() })}
                  required
                  helperText="Código único del proveedor (ej: PROV001)"
                  inputProps={{ maxLength: 20 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Nombre del Proveedor"
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  required
                  helperText="Nombre completo o razón social"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Dirección"
                  value={vendorForm.address}
                  onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Ciudad"
                  value={vendorForm.city}
                  onChange={(e) => setVendorForm({ ...vendorForm, city: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Persona de Contacto"
                  value={vendorForm.contact}
                  onChange={(e) => setVendorForm({ ...vendorForm, contact: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Teléfono"
                  value={vendorForm.phoneNo}
                  onChange={(e) => setVendorForm({ ...vendorForm, phoneNo: e.target.value })}
                  type="tel"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                  type="email"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Select
                  label="Moneda"
                  value={vendorForm.currencyCode}
                  onChange={(e) => setVendorForm({ ...vendorForm, currencyCode: e.target.value })}
                >
                  <MenuItem value="HNL">Lempira (HNL)</MenuItem>
                  <MenuItem value="USD">Dólar (USD)</MenuItem>
                  <MenuItem value="EUR">Euro (EUR)</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Términos de Pago"
                  value={vendorForm.paymentTermsCode}
                  onChange={(e) => setVendorForm({ ...vendorForm, paymentTermsCode: e.target.value })}
                  helperText="ej: 30 días, Contado, etc."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenVendorDialog(false);
            resetVendorForm();
            setSelectedItem(null);
          }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateVendor}
            variant="contained"
            disabled={!vendorForm.no || !vendorForm.name}
          >
            {selectedItem ? 'Actualizar' : 'Crear'} Proveedor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryManager; 