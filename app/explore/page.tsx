import ExplorePage from '@/components/ExplorePage';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import { getCurrentProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const profile = await getCurrentProfile();

  return (
    <>
      <NavBar isAdmin={profile?.role === 'admin'} email={profile?.email ?? ''} />
      <ExplorePage isAdmin={profile?.role === 'admin'} />
      <Footer />
    </>
  );
}