'use client'

import { useSession } from 'next-auth/react'
import useGetMe from './hooks/useGetMe'
import GeoUpdater from '@/shared/components/GeoUpdater/GeoUpdater'

function InitUser() {
  const { data: session, status } = useSession()

  // ✅ hook always called
  useGetMe(status === 'authenticated')

  return (
    <>
      <GeoUpdater userId={session?.user?.id} />
    </>
  )
}

export default InitUser