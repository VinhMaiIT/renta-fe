'use client';

import { useState } from 'react';
import { usePagination } from '@/hooks/use-pagination';
import { useMasterData } from '@/features/master-data/use-master-data';
import type { MasterInput, MasterRecord } from '@/features/master-data/api';
import type { ActiveStatus } from '@/types/enums';

/**
 * Orchestration hook for the Units screen: pagination + list query + CRUD
 * mutations + dialog state, exposed as a single API the page consumes. Keeps
 * all data/logic out of the presentational components.
 */
export function useUnits() {
  const { useList, useCreate, useUpdate, useRemove, useSetStatus } = useMasterData('units');
  const pagination = usePagination();
  const list = useList(pagination.queryParams);
  const create = useCreate();
  const update = useUpdate();
  const remove = useRemove();
  const setStatus = useSetStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MasterRecord | null>(null);
  const [deleting, setDeleting] = useState<MasterRecord | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (unit: MasterRecord) => {
    setEditing(unit);
    setFormOpen(true);
  };

  const submit = (input: MasterInput) => {
    if (editing) {
      update.mutate({ id: editing.id, input }, { onSuccess: () => setFormOpen(false) });
    } else {
      create.mutate(input, { onSuccess: () => setFormOpen(false) });
    }
  };

  const toggleStatus = (unit: MasterRecord) => {
    const next: ActiveStatus = unit.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStatus.mutate({ id: unit.id, status: next });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return {
    pagination,
    list,
    data: list.data,
    rows: list.data?.items ?? [],
    saving: create.isPending || update.isPending,
    deleting,
    setDeleting,
    removing: remove.isPending,
    formOpen,
    setFormOpen,
    editing,
    openCreate,
    openEdit,
    submit,
    toggleStatus,
    confirmDelete,
  };
}
