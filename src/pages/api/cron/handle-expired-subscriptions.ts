import { NextApiRequest, NextApiResponse } from "next";
import { handleExpiredSubscriptions } from "@/app/(main)/users/[username]/actions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await handleExpiredSubscriptions();
    res.status(200).json({ message: "Expired subscriptions handled successfully" });
  } catch (error) {
    console.error("Error handling expired subscriptions:", error);
    res.status(500).json({ message: "Error handling expired subscriptions" });
  }
} 