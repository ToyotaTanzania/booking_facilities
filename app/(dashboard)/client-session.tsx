"use client";

import { useSession } from "next-auth/react";

const ClientSession = () => {
  const { data } = useSession();
  const access = (data as any)?.supabase?.access_token;
  return <div>{JSON.stringify(access)}</div>;
};

export default ClientSession;