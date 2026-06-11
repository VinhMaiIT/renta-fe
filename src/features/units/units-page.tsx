'use client';

import { Plus } from 'lucide-react';
import { ListPageHeader } from '@/components/common/list-page-header';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { StatusBadge } from '@/components/common/status-badge';
import { DataTableView, type Column } from '@/components/tables/data-table-view';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { MasterDataForm } from '@/features/master-data/master-data-form';
import { RowActions } from '@/components/common/row-actions';
import type { MasterRecord } from '@/features/master-data/api';
import { ACTIVE_STATUS_META } from '@/constants/enum-labels';
import { formatDate } from '@/lib/format';
import { useT } from '@/i18n/locale-provider';
import { useUnits } from './use-units';

/** Units screen: data hook + header + design-system DataTable + dialogs. */
export function UnitsPage() {
  const { t } = useT();
  const u = useUnits();
  const { pagination, data } = u;

  const title = t('masterData.units.title');
  const singular = t('masterData.units.singular');

  const columns: Column<MasterRecord>[] = [
    {
      id: 'name',
      header: t('common.table.name'),
      cell: (unit) => <span className="font-medium">{unit.name}</span>,
    },
    {
      id: 'status',
      header: t('common.table.status'),
      cell: (unit) => <StatusBadge meta={ACTIVE_STATUS_META[unit.status]} />,
    },
    {
      id: 'updatedAt',
      header: t('common.table.updated'),
      hideBelow: 'md',
      cell: (unit) => formatDate(unit.updatedAt),
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (unit) => (
        <RowActions
          onEdit={() => u.openEdit(unit)}
          onToggleStatus={() => u.toggleStatus(unit)}
          isActive={unit.status === 'ACTIVE'}
          onDelete={() => u.setDeleting(unit)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ListPageHeader
        title={t('masterData.countSummary', {
          count: data?.items.length ?? 0,
          total: data?.total ?? 0,
        })}
        titleClassName="text-base font-semibold sm:text-base"
        search={pagination.search}
        onSearchChange={pagination.setSearch}
        searchPlaceholder={t('masterData.searchPlaceholder', { items: title.toLowerCase() })}
        filters={
          <NativeSelect
            value={pagination.filters.status ?? ''}
            onChange={(e) => pagination.setFilter('status', e.target.value || undefined)}
            aria-label={t('common.table.status')}
            className="bg-card"
          >
            <NativeSelectOption value="">{t('common.table.allStatuses')}</NativeSelectOption>
            <NativeSelectOption value="ACTIVE">{t('enums.activeStatus.ACTIVE')}</NativeSelectOption>
            <NativeSelectOption value="INACTIVE">{t('enums.activeStatus.INACTIVE')}</NativeSelectOption>
          </NativeSelect>
        }
        actions={
          <Button onClick={u.openCreate}>
            <Plus className="size-4" />
            {t('masterData.newItem', { item: singular })}
          </Button>
        }
      />

      <DataTableView
        columns={columns}
        rows={u.rows}
        isLoading={u.list.isLoading}
        isError={u.list.isError}
        error={u.list.error}
        onRetry={() => u.list.refetch()}
        emptyTitle={t('masterData.emptyTitle', { items: title.toLowerCase() })}
        page={data?.page ?? pagination.page}
        pageSize={data?.pageSize ?? pagination.pageSize}
        total={data?.total ?? 0}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <MasterDataForm
        open={u.formOpen}
        onOpenChange={u.setFormOpen}
        singular={singular}
        initial={u.editing}
        loading={u.saving}
        onSubmit={u.submit}
      />

      <ConfirmDialog
        open={Boolean(u.deleting)}
        onOpenChange={(open) => !open && u.setDeleting(null)}
        title={t('common.confirm.deleteTitle', { item: singular })}
        description={u.deleting ? t('masterData.deleteDesc', { name: u.deleting.name }) : null}
        destructive
        confirmText={t('common.action.delete')}
        loading={u.removing}
        onConfirm={u.confirmDelete}
      />
    </div>
  );
}
