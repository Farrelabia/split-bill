'use client';

import { useAdminCode } from '../_lib/admin-session';
import { useBill } from '../_lib/use-bill';
import BillForm from './bill-form';
import { BillLoadState, PageHeading } from './ui';

function EditForm({ bill }) {
  const admin = useAdminCode(bill.shareCode);
  return <BillForm bill={bill} admin={admin} />;
}

export default function EditBill({ shareCode }) {
  const { bill, error, retry } = useBill(shareCode);
  if (!bill) return <BillLoadState invalid={!shareCode} error={error} retry={retry} />;
  return (
    <>
      <PageHeading title="Edit tagihan" description={bill.title} back={`/bills/${bill.shareCode}`} backLabel="Detail tagihan" />
      <EditForm key={bill.shareCode} bill={bill} />
    </>
  );
}
