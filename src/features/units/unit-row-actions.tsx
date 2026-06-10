'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useT } from '@/i18n/locale-provider';
import type { MasterRecord } from '@/features/master-data/api';

interface UnitRowActionsProps {
  unit: MasterRecord;
  onEdit: (unit: MasterRecord) => void;
  onToggleStatus: (unit: MasterRecord) => void;
  onDelete: (unit: MasterRecord) => void;
}

/** Per-row actions menu for a unit (edit / activate-deactivate / delete). */
export function UnitRowActions({ unit, onEdit, onToggleStatus, onDelete }: UnitRowActionsProps) {
  const { t } = useT();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={t('common.table.actions')}>
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(unit)}>{t('common.action.edit')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(unit)}>
          {unit.status === 'ACTIVE' ? t('masterData.deactivate') : t('masterData.activate')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(unit)}>
          {t('common.action.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
