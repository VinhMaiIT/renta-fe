'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { ErrorState } from '@/components/common/states';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CONDITION_STATUS_META } from '@/constants/enum-labels';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { useReturnTransaction } from './use-returns';
import type { ReturnTransaction } from '@/types/models';

interface ReturnDetailProps {
  id: string;
}

export function ReturnDetail({ id }: ReturnDetailProps) {
  const router = useRouter();
  const query = useReturnTransaction(id);

  const backButton = (
    <Button variant="outline" size="sm" onClick={() => router.push('/return-transactions')}>
      <ArrowLeft className="size-4" />
      Back
    </Button>
  );

  if (query.isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Return" actions={backButton} />
        <Card>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="space-y-5">
        <PageHeader title="Return" actions={backButton} />
        <ErrorState
          description={query.error instanceof Error ? query.error.message : undefined}
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  const tx: ReturnTransaction = query.data;

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Return #${tx.id}`}
        description={`Recorded ${formatDateTime(tx.createdAt)}`}
        actions={backButton}
      />

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            <Field label="Rental order">
              <Link
                href={`/rental-orders/${tx.rentalOrderId}`}
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                #{tx.rentalOrderId}
              </Link>
            </Field>
            <Field label="Branch">#{tx.branchId}</Field>
            <Field label="Created by">#{tx.createdBy}</Field>
            <Field label="Return date">{formatDateTime(tx.returnDate)}</Field>
            <Field label="Late fee">{formatCurrency(tx.lateFee)}</Field>
            <Field label="Damage fee">{formatCurrency(tx.damageFee)}</Field>
            <Field label="Total">
              <span className="font-semibold">{formatCurrency(tx.totalAmount)}</span>
            </Field>
            {tx.note ? <Field label="Note">{tx.note}</Field> : null}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Returned items ({tx.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-border overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order item</TableHead>
                  <TableHead>Inventory item</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Damage fee</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tx.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">#{item.rentalOrderItemId}</TableCell>
                    <TableCell className="font-mono text-sm">#{item.inventoryItemId}</TableCell>
                    <TableCell>
                      <StatusBadge meta={CONDITION_STATUS_META[item.conditionStatus]} />
                    </TableCell>
                    <TableCell>{formatCurrency(item.damageFee)}</TableCell>
                    <TableCell className="text-muted-foreground">{item.note ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
