import { getContentFresh } from '@/lib/content';
import AdminDashboard from '@/components/admin/AdminDashboard';

// Always render fresh content for the editor (no static caching here).
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const content = await getContentFresh();
  return <AdminDashboard initial={content} />;
}
