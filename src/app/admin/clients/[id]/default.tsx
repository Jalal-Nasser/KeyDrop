import { notFound } from 'next/navigation';

export default function DefaultClientPage() {
  // This will never be shown as we'll redirect to the orders page
  notFound();
}
