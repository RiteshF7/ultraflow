import { marketingConfig } from '@/config/marketing';
import FooterPrimary from '@/components/footer-primary';
import CircularNavigation from '@/components/navigation';
import React from 'react';

import { getUser } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/client';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default async function MarketingLayout({
  children
}: MarketingLayoutProps) {
  const supabase = createClient();
  const user = await getUser(supabase);

  return (
    <div className="flex h-screen flex-col items-center w-full overflow-hidden">
      <CircularNavigation items={marketingConfig.mainNav} user={user ? true : false} />
      <main className="flex-1 w-full overflow-hidden">{children}</main>
    </div>
  );
}
