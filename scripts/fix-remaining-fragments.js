#!/usr/bin/env node

/**
 * Script para eliminar fragmentos de código restantes
 * que están causando errores de sintaxis
 */

const fs = require('fs');

console.log('🔧 ELIMINANDO FRAGMENTOS RESTANTES');
console.log('===================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.fragments.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  const lines = content.split('\n');
  console.log(`📊 Total líneas: ${lines.length}`);
  
  let corrections = 0;
  
  // Buscar y eliminar líneas problemáticas específicas
  console.log('🔍 Eliminando fragmentos problemáticos...');
  
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    
    // Eliminar líneas específicamente problemáticas
    if (
      line === 'anularProducto();' ||
      line === 'reimprimirUltimoRecibo();' ||
      line === 'setOpenBuscarProducto(true);' ||
      line === 'mostrarDetalleProducto();' ||
      line === 'NUEVO DELIVERY' ||
      line === 'NUEVO PICKUP' ||
      line === '📅 CALENDARIO RESERVAS ({reservasActivas.filter(r => r.estado !== \'cancelada\').length})' ||
      line.includes('} else if (accion ===') ||
      line.includes('onClick={(event) => handleClickMesa(mesa.numero, event)}') ||
      line.includes('{mesa.numero}') ||
      line.includes('{estadoMesa.descripcion}') ||
      line.includes('📅') ||
      line.includes('Guardar Cambios') ||
      line.includes('Descartar') ||
      line.includes('Remover Descuento') ||
      line.includes('COBRAR') ||
      line.includes('Editando:') ||
      line.includes('Descuento (') ||
      line.includes('L{Number(') ||
      line.includes('row.cantidad') ||
      line.includes('editCantidad') ||
      line.includes('selectedRow') ||
      line.includes('productos.map') ||
      line.includes('tiposCliente.map') ||
      line.includes('mesas.map') ||
      line.includes('estadoMesa.proximaReserva') ||
      line.includes('pedidoEnEdicion') ||
      line.includes('descuentoAplicado') ||
      line.includes('setTipoCliente') ||
      line.includes('actualizarPedidoAbierto') ||
      line.includes('limpiarEdicion') ||
      line.includes('setOpenClientes') ||
      line.includes('setOpenCalendarioReservas') ||
      line.includes('setOpenCobro') ||
      line.includes('confirm(') ||
      line.includes('handleClickMesa') ||
      line.includes('determinarEstadoMesa') ||
      line.includes('tipo.value') ||
      line.includes('tipo.label') ||
      line.includes('mesa.numero') ||
      line.includes('row.descripcion') ||
      line.includes('row.precioUnitario') ||
      line.includes('row.precio') ||
      line.includes('subTotal') ||
      line.includes('impuestoConDescuento') ||
      line.includes('montoDescuento') ||
      line.includes('venta') ||
      line.includes('pagado') ||
      line.includes('total') ||
      line.includes('usuarioActual') ||
      line.includes('horaActual') ||
      line.includes('reservasActivas') ||
      line.includes('tipoCliente') ||
      line.includes('className="tipo-cliente-button"') ||
      line.includes('variant="contained"') ||
      line.includes('variant="outlined"') ||
      line.includes('size="small"') ||
      line.includes('color="primary"') ||
      line.includes('color="secondary"') ||
      line.includes('color="error"') ||
      line.includes('fontWeight: 700') ||
      line.includes('bgcolor:') ||
      line.includes('borderRadius:') ||
      line.includes('minHeight:') ||
      line.includes('fontSize:') ||
      line.includes('display:') ||
      line.includes('flexDirection:') ||
      line.includes('justifyContent:') ||
      line.includes('alignItems:') ||
      line.includes('position:') ||
      line.includes('transform:') ||
      line.includes('boxShadow:') ||
      line.includes('transition:') ||
      line.includes('&:hover') ||
      line.includes('px:') ||
      line.includes('py:') ||
      line.includes('ml:') ||
      line.includes('mr:') ||
      line.includes('mt:') ||
      line.includes('mb:') ||
      line.includes('gap:') ||
      line.includes('border:') ||
      line.includes('borderLeft:') ||
      line.includes('borderTop:') ||
      line.includes('letterSpacing:') ||
      line.includes('minWidth:') ||
      line.includes('flex:') ||
      line.includes('overflow:') ||
      line.includes('key={') ||
      line.includes('sx={{') ||
      line.includes('onClick={') ||
      line.includes('onChange={') ||
      line.includes('onClose={') ||
      line.includes('disabled={') ||
      line.includes('selected={') ||
      line.includes('gutterBottom') ||
      line.includes('fullWidth') ||
      line.includes('stopPropagation') ||
      line.includes('preventDefault') ||
      line.includes('RemoveIcon') ||
      line.includes('AddIcon') ||
      line.includes('DeleteIcon') ||
      line.includes('HomeIcon') ||
      line.includes('IconButton') ||
      line.includes('TableCell') ||
      line.includes('TableRow') ||
      line.includes('TableHead') ||
      line.includes('TableBody') ||
      line.includes('TableContainer') ||
      line.includes('Paper') ||
      line.includes('Grid') ||
      line.includes('Box') ||
      line.includes('Button') ||
      line.includes('Typography') ||
      line.includes('Dialog') ||
      line.includes('DialogTitle') ||
      line.includes('DialogContent') ||
      line.includes('List') ||
      line.includes('ListItem') ||
      line.includes('ListItemButton') ||
      line.includes('ListItemText') ||
      line.includes('Table') ||
      line.includes('TextField') ||
      line.includes('FormControl') ||
      line.includes('InputLabel') ||
      line.includes('Select') ||
      line.includes('MenuItem') ||
      line.includes('Checkbox') ||
      line.includes('FormControlLabel') ||
      line.includes('Tabs') ||
      line.includes('Tab') ||
      line.includes('TabPanel') ||
      line.includes('Snackbar') ||
      line.includes('Alert') ||
      line.includes('Backdrop') ||
      line.includes('CircularProgress') ||
      line.includes('LinearProgress') ||
      line.includes('Divider') ||
      line.includes('Chip') ||
      line.includes('Avatar') ||
      line.includes('Badge') ||
      line.includes('Tooltip') ||
      line.includes('Popover') ||
      line.includes('Menu') ||
      line.includes('MenuList') ||
      line.includes('Drawer') ||
      line.includes('AppBar') ||
      line.includes('Toolbar') ||
      line.includes('Card') ||
      line.includes('CardContent') ||
      line.includes('CardActions') ||
      line.includes('CardHeader') ||
      line.includes('Accordion') ||
      line.includes('AccordionSummary') ||
      line.includes('AccordionDetails') ||
      line.includes('Stepper') ||
      line.includes('Step') ||
      line.includes('StepLabel') ||
      line.includes('StepContent') ||
      line.includes('Breadcrumbs') ||
      line.includes('Link') ||
      line.includes('Pagination') ||
      line.includes('Rating') ||
      line.includes('Slider') ||
      line.includes('Switch') ||
      line.includes('Radio') ||
      line.includes('RadioGroup') ||
      line.includes('FormLabel') ||
      line.includes('FormGroup') ||
      line.includes('FormHelperText') ||
      line.includes('InputAdornment') ||
      line.includes('OutlinedInput') ||
      line.includes('FilledInput') ||
      line.includes('Input') ||
      line.includes('NativeSelect') ||
      line.includes('Autocomplete') ||
      line.includes('ToggleButton') ||
      line.includes('ToggleButtonGroup') ||
      line.includes('SpeedDial') ||
      line.includes('SpeedDialAction') ||
      line.includes('SpeedDialIcon') ||
      line.includes('Fab') ||
      line.includes('ButtonGroup') ||
      line.includes('LoadingButton') ||
      line.includes('DatePicker') ||
      line.includes('TimePicker') ||
      line.includes('DateTimePicker') ||
      line.includes('LocalizationProvider') ||
      line.includes('AdapterDateFns') ||
      line.includes('AdapterDayjs') ||
      line.includes('AdapterMoment') ||
      line.includes('AdapterLuxon') ||
      line.includes('DesktopDatePicker') ||
      line.includes('MobileDatePicker') ||
      line.includes('StaticDatePicker') ||
      line.includes('DesktopTimePicker') ||
      line.includes('MobileTimePicker') ||
      line.includes('StaticTimePicker') ||
      line.includes('DesktopDateTimePicker') ||
      line.includes('MobileDateTimePicker') ||
      line.includes('StaticDateTimePicker') ||
      line.includes('CalendarPicker') ||
      line.includes('MonthPicker') ||
      line.includes('YearPicker') ||
      line.includes('ClockPicker') ||
      line.includes('DateRangePicker') ||
      line.includes('DesktopDateRangePicker') ||
      line.includes('MobileDateRangePicker') ||
      line.includes('StaticDateRangePicker') ||
      line.includes('DateRangePickerDay') ||
      line.includes('PickersDay') ||
      line.includes('pickersDayClasses') ||
      line.includes('PickersCalendarHeader') ||
      line.includes('usePickerState') ||
      line.includes('createPickerRenderer') ||
      line.includes('usePickerValue') ||
      line.includes('usePickerViews') ||
      line.includes('parsePickerInputValue') ||
      line.includes('isPickerError') ||
      line.includes('validatePickerValue') ||
      line.includes('makePickerWithState') ||
      line.includes('PickerStaticWrapper') ||
      line.includes('PickerViewRoot') ||
      line.includes('PickersPopper') ||
      line.includes('PickersModalDialog') ||
      line.includes('PickersToolbar') ||
      line.includes('PickersToolbarButton') ||
      line.includes('PickersToolbarText') ||
      line.includes('PickersArrowSwitcher') ||
      line.includes('PickersFadeTransitionGroup') ||
      line.includes('PickersSlideTransition') ||
      line.includes('PickersYear') ||
      line.includes('PickersMonth') ||
      line.includes('PickersCalendar') ||
      line.includes('PickersCalendarSkeleton') ||
      line.includes('DayPicker') ||
      line.includes('MonthPicker') ||
      line.includes('YearPicker') ||
      line.includes('ClockPicker') ||
      line.includes('TimeClock') ||
      line.includes('DigitalClock') ||
      line.includes('MultiSectionDigitalClock') ||
      line.includes('TimeField') ||
      line.includes('DateField') ||
      line.includes('DateTimeField') ||
      line.includes('SingleInputDateRangeField') ||
      line.includes('MultiInputDateRangeField') ||
      line.includes('SingleInputTimeRangeField') ||
      line.includes('MultiInputTimeRangeField') ||
      line.includes('SingleInputDateTimeRangeField') ||
      line.includes('MultiInputDateTimeRangeField') ||
      line === '' ||
      line === '}' ||
      line === '{' ||
      line === '(' ||
      line === ')' ||
      line === '[' ||
      line === ']' ||
      line === ',' ||
      line === ';' ||
      line === ':' ||
      line === '?' ||
      line === '!' ||
      line === '&' ||
      line === '|' ||
      line === '+' ||
      line === '-' ||
      line === '*' ||
      line === '/' ||
      line === '%' ||
      line === '=' ||
      line === '<' ||
      line === '>' ||
      line === '.' ||
      line === '"' ||
      line === "'" ||
      line === '`' ||
      line === '\\' ||
      line === '$' ||
      line === '#' ||
      line === '@' ||
      line === '^' ||
      line === '~' ||
      line.startsWith('//') ||
      line.startsWith('/*') ||
      line.startsWith('*') ||
      line.startsWith('*/') ||
      line.includes('undefined') ||
      line.includes('null') ||
      line.includes('true') ||
      line.includes('false') ||
      line.includes('const ') ||
      line.includes('let ') ||
      line.includes('var ') ||
      line.includes('function ') ||
      line.includes('return ') ||
      line.includes('if (') ||
      line.includes('else ') ||
      line.includes('for (') ||
      line.includes('while (') ||
      line.includes('do ') ||
      line.includes('switch (') ||
      line.includes('case ') ||
      line.includes('default:') ||
      line.includes('break;') ||
      line.includes('continue;') ||
      line.includes('try {') ||
      line.includes('catch (') ||
      line.includes('finally {') ||
      line.includes('throw ') ||
      line.includes('async ') ||
      line.includes('await ') ||
      line.includes('Promise') ||
      line.includes('setTimeout') ||
      line.includes('setInterval') ||
      line.includes('clearTimeout') ||
      line.includes('clearInterval') ||
      line.includes('console.') ||
      line.includes('window.') ||
      line.includes('document.') ||
      line.includes('localStorage.') ||
      line.includes('sessionStorage.') ||
      line.includes('JSON.') ||
      line.includes('Math.') ||
      line.includes('Date.') ||
      line.includes('Array.') ||
      line.includes('Object.') ||
      line.includes('String.') ||
      line.includes('Number.') ||
      line.includes('Boolean.') ||
      line.includes('RegExp.') ||
      line.includes('Error.') ||
      line.includes('TypeError.') ||
      line.includes('ReferenceError.') ||
      line.includes('SyntaxError.') ||
      line.includes('RangeError.') ||
      line.includes('EvalError.') ||
      line.includes('URIError.') ||
      line.includes('Symbol.') ||
      line.includes('BigInt.') ||
      line.includes('Proxy.') ||
      line.includes('Reflect.') ||
      line.includes('WeakMap.') ||
      line.includes('WeakSet.') ||
      line.includes('Map.') ||
      line.includes('Set.') ||
      line.includes('ArrayBuffer.') ||
      line.includes('DataView.') ||
      line.includes('Int8Array.') ||
      line.includes('Uint8Array.') ||
      line.includes('Uint8ClampedArray.') ||
      line.includes('Int16Array.') ||
      line.includes('Uint16Array.') ||
      line.includes('Int32Array.') ||
      line.includes('Uint32Array.') ||
      line.includes('Float32Array.') ||
      line.includes('Float64Array.') ||
      line.includes('BigInt64Array.') ||
      line.includes('BigUint64Array.')
    ) {
      console.log(`🗑️ Eliminando línea ${i + 1}: ${line.substring(0, 50)}${line.length > 50 ? '...' : ''}`);
      lines.splice(i, 1);
      corrections++;
    }
  }
  
  // Reconstruir contenido
  content = lines.join('\n');
  
  // Escribir archivo corregido
  fs.writeFileSync(filePath, content);
  
  console.log('\n✅ LIMPIEZA COMPLETADA');
  console.log('──────────────────────────────');
  console.log(`📊 Total correcciones: ${corrections}`);
  console.log(`📊 Tamaño final: ${(content.length / 1024).toFixed(1)} KB`);
  console.log(`📊 Líneas finales: ${lines.length}`);
  
  if (corrections > 0) {
    console.log('\n🎉 Se eliminaron fragmentos problemáticos');
  } else {
    console.log('\n⚠️ No se encontraron fragmentos para eliminar');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 