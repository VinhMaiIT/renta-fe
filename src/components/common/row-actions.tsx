'use client';

import type { ReactNode } from 'react';
import { Pencil, Power, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/locale-provider';

interface RowActionsProps {
  onEdit?: () => void;
  /** Toggle ACTIVE/INACTIVE; `isActive` drives the label. */
  onToggleStatus?: () => void;
  isActive?: boolean;
  /** Set as main branch (branches only). */
  onSetMain?: () => void;
  onDelete?: () => void;
}

function IconButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      className={cn('border', className)}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

/** Inline per-row actions (edit / set-main / toggle status / delete) shown directly in the cell. */
export function RowActions({ onEdit, onToggleStatus, isActive, onSetMain, onDelete }: RowActionsProps) {
  const { t } = useT();
  return (
    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
      {onEdit ? (
        <IconButton
          label={t('common.action.edit')}
          onClick={onEdit}
          className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
        >
          <Pencil className="size-4" />
        </IconButton>
      ) : null}
      {onSetMain ? (
        <IconButton
          label={t('branches.setMain')}
          onClick={onSetMain}
          className="border-warning/40 bg-warning/15 text-warning hover:bg-warning/25 hover:text-warning"
        >
          <Star className="size-4" />
        </IconButton>
      ) : null}
      {onToggleStatus ? (
        <IconButton
          label={isActive ? t('masterData.deactivate') : t('masterData.activate')}
          onClick={onToggleStatus}
          className="border-success/30 bg-success/15 text-success hover:bg-success/25 hover:text-success"
        >
          <Power className="size-4" />
        </IconButton>
      ) : null}
      {onDelete ? (
        <IconButton
          label={t('common.action.delete')}
          onClick={onDelete}
          className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </IconButton>
      ) : null}
    </div>
  );
}
