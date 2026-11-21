import EditBill from '../../../_components/edit-bill';
import { normalizeShareCode } from '../../../_lib/bill-input.mjs';

export const metadata = { title: 'Edit tagihan' };

export default async function EditBillPage({ params }) {
  const { shareCode } = await params;
  return <EditBill shareCode={normalizeShareCode(shareCode)} />;
}
