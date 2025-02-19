"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BALANCE_OPTIONS = [
  { amount: 10, label: "$10 Wallet Balance" },
  { amount: 25, label: "$25 Wallet Balance" },
  { amount: 50, label: "$50 Wallet Balance" },
  { amount: 100, label: "$100 Wallet Balance" },
  { amount: 500, label: "$500 Wallet Balance" },
];

export default function BalanceMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const addBalance = async (amount: number) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/balance/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) throw new Error("Failed to add balance");
      
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error adding balance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-card shadow-lg">
      <div className="p-2 space-y-2">
        {BALANCE_OPTIONS.map((option) => (
          <button
            key={option.amount}
            onClick={() => addBalance(option.amount)}
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm text-left hover:bg-accent rounded-md transition-colors"
          >
            {option.label}
            <span className="float-right">${option.amount}</span>
          </button>
        ))}
      </div>
    </div>
  );
}