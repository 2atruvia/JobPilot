import { getProfile } from '@/lib/supabase/queries'
import { ProfileForm } from '@/components/app/profile-form'

export default async function ProfilePage() {
  const profile = await getProfile()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Target roles, locations, and keywords used by the AI scorer.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  )
}
