'use client'

import { useSession } from "next-auth/react";

export default function CheckAuth() {
  const { data: session } = useSession();

  if(!session){
    return <div>Not authenticated</div>;
  }

  return <div>Authenticated {session.user?.email}</div>;
}