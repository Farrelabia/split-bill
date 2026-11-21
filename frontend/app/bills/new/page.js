import BillForm from '../../_components/bill-form';
import { PageHeading } from '../../_components/ui';

export const metadata = { title: 'Buat tagihan' };

export default function NewBill() {
  return (
    <>
      <PageHeading title="Buat tagihan" description="Isi detail dan cek pembagian rata sebelum membagikan tagihan." />
      <BillForm />
    </>
  );
}
