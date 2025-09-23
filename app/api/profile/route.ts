import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Supabase Webhook Handler for creating a user profile.
 *
 * This API route is designed to be called by a Supabase webhook
 * whenever a new user is created (e.g., via auth.users INSERT event).
 * It will automatically insert a new row into the 'profiles' table
 * using the new user's ID and other information.
 *
 * --- Setup Instructions ---
 * 1. Ensure you have a 'profiles' table in your Supabase database with the following schema:
 * - `id` (UUID, primary key, references auth.users.id)
 * - `created_at` (timestamp with time zone)
 * - `user_id` (UUID)
 * - `name` (text)
 * - `phone` (text)
 * - `unit` (text)
 * - `segment` (text)
 * - `division` (text)
 * - `legal_entity` (text)
 * - `isActive` (boolean)
 * - `role` (text)
 * - `email` (text)
 *
 * 2. In your Supabase Dashboard, navigate to `Database > Webhooks`.
 * 3. Create a new webhook with the following settings:
 * - **Name:** User Profile Creation
 * - **URL:** Your deployment URL + `/api/webhooks/create-profile`
 * (e.g., `https://your-domain.vercel.app/api/webhooks/create-profile`)
 * - **Method:** POST
 * - **Headers:** (Optional, but recommended for security)
 * - `Authorization`: `Bearer your-webhook-secret` (or similar)
 * - **Table:** `auth.users`
 * - **Events:** `INSERT`
 *
 * 4. This code assumes you have a `SUPABASE_URL` and `SUPABASE_SECRET_KEY`
 * environment variables set up in your Next.js project.
 *
 * @param req The incoming request from the Supabase webhook.
 * @param res The response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests from the webhook
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Optional: Verify the webhook secret to ensure the request is from Supabase
  // const secret = req.headers.authorization?.split(" ")[1];
  // if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  // Extract the new user object from the request body
  const { record: newUser } = req.body;

  if (!newUser || !newUser.id) {
    return res.status(400).json({ message: "Missing user data" });
  }

  try {
    // Create a Supabase client with service role access to bypass RLS
    const supabase = await createSupabaseServerClient({
      req,
      res,
    });

    // Check if a profile already exists for this user to prevent duplicates
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", newUser.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is 'No rows found'
      console.error("Error fetching existing profile:", fetchError);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (existingProfile) {
      // Profile already exists, nothing to do
      return res.status(200).json({ message: "Profile already exists" });
    }

    // Insert a new row into the 'profiles' table with all the new fields
    const { data, error } = await supabase.from("profiles").insert([
      {
        id: newUser.id,
        userid: newUser.id,
        created_at: newUser.created_at,
        email: newUser.email,
        // name: newUser.user_metadata?.name || null,
        // phone: newUser.user_metadata?.phone || null,
        // unit: newUser.user_metadata?.unit || null,
        // segment: newUser.user_metadata?.segment || null,
        // division: newUser.user_metadata?.division || null,
        // legal_entity: newUser.user_metadata?.legal_entity || null,
        role: "user", // Default to 'user' role
        isActive: true, // Default to true
      },
    ]);

    if (error) {
      console.error("Error inserting profile:", error);
      return res.status(500).json({ message: "Error creating user profile" });
    }

    return res.status(200).json({ message: "Profile created successfully" });
  } catch (error) {
    console.error("Unhandled error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
