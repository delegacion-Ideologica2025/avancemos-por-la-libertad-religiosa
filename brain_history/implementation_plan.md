# Vinculación de Datos de Senadores por Departamento

Este plan detalla la actualización de la vista de Senadores para que los datos de los perfiles (especialmente Manuel Virgüez) sean dinámicos y se calculen a partir de la suma de departamentos específicos cargados en el sistema.

## Cambios Propuestos

### Componentes de Dashboard

#### [MODIFY] [senadores-view.tsx](file:///C:/Users/Diego/.gemini/antigravity/scratch/dashboard-metas/src/components/dashboard/senadores-view.tsx)
- Modificar el componente para recibir `data: DashboardData` como prop.
- Implementar una utilidad de agregación que sume `meta` y `referidos` de los departamentos asignados a cada senador.
- **Manuel Virgüez**: Atlántico, Bolívar, Córdoba, Magdalena, Cesar, Chocó, Norte de Santander, La Guajira, San Andrés, Santander, Sucre, Antioquia, Caldas, Quindío, Risaralda.
- **Carlos Eduardo Guevara**: Cundinamarca, Bogotá, Boyacá.
- **Ana Paola Agudelo**: Amazonas, Caquetá, Casanare, Cauca, Consulados, Guainía, Guaviare, Huila, Meta, Nariño, Putumayo, Tolima, Vaupés, Vichada, Arauca, Valle del Cauca.
- Update `SenatorCard` to use these dynamic values.

#### [MODIFY] [page.tsx](file:///C:/Users/Diego/.gemini/antigravity/scratch/dashboard-metas/src/app/page.tsx)
- Pasar el objeto `data` global al componente `<SenadoresView />` cuando este se renderice.

## Plan de Verificación

### Manual
- Cargar archivos Excel con datos reales/mock.
- Verificar que los valores de Manuel Virgüez coincidan con la sumatoria de sus departamentos.
- Validar que el porcentaje de avance se calcule correctamente sobre la meta dinámica del hito seleccionado.
