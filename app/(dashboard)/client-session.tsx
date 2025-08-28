"use client";

import { useSession } from "next-auth/react";

const ClientSession = () => {
  const { data } = useSession();
  const access = (data as any)?.supabase?.access_token;
  return <div>{JSON.stringify(data)}</div>;
};

export default ClientSession;