import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubscriptionTier } from "@prisma/client";
import { useState } from "react";
import { subscribe } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { User } from "lucia";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: SubscriptionTier;
  loggedInUser: User | null;
}

export default function SubscriptionDialog({ open, onOpenChange, tier, loggedInUser }: SubscriptionDialogProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!loggedInUser) {
      setError("You must be logged in to subscribe.");
      return;
    }
    if (loggedInUser.balance < Number(tier.price)) {
      setError("Insufficient balance to subscribe to this tier.");
      return;
    }
    setIsLoading(true);
    try {
      await subscribe(tier.id);
      toast({
        description: `Successfully subscribed to ${tier.name}!`,
      });
      onOpenChange(false);
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscribe to {tier.name}</DialogTitle>
          <DialogDescription>
            Price: ${Number(tier.price).toFixed(2)} / {tier.durationInMonths} month{tier.durationInMonths > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-red-500">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubscribe} disabled={isLoading}>
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 