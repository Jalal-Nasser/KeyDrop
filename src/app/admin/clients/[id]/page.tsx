import { notFound, redirect } from 'next/navigation';

export default function ClientPage({ params }: { params: { id: string } }) {
  // Redirect to the orders page by default
  redirect(`/admin/clients/${params.id}/orders`);
}
