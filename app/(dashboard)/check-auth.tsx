'use client'

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CheckAuth() {
  const { data: session } = useSession();
  const navigate = useRouter()

  if(!session){
    navigate.push('/auth/signin')
    return null
  }

  return null
}