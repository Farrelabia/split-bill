import BillDetail from '../../_components/bill-detail';
import { normalizeShareCode } from '../../_lib/bill-input.mjs';

export const metadata = { title: 'Detail tagihan' };

export default async function BillPage({ params }) {
  const { shareCode } = await params;
  const code = normalizeShareCode(shareCode);
  return <BillDetail key={code} shareCode={code} />;
}
