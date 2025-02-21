"use client";

import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import Linkify from "@/components/Linkify";
import UserAvatar from "@/components/UserAvatar";
import { FollowerInfo, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import EditProfileButton from "./EditProfileButton";
import SubscriptionDialog from "./SubscriptionDialog";
import { SubscriptionTier } from "@prisma/client";
import { useState } from "react";
import { getLoggedInUser } from "./actions";
import { User } from "lucia";

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

export default function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };

  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const openSubscriptionDialog = async (tier: SubscriptionTier) => {
    const user = await getLoggedInUser();
    setLoggedInUser(user);
    setSelectedTier(tier);
    setSubscriptionDialogOpen(true);
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.username}</div>
          </div>
          <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>
        {user.id === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>
      {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="overflow-hidden whitespace-pre-line break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
      {user.createdTiers && user.createdTiers.length > 0 && (
        <>
          <hr />
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Subscription Tiers</h2>
            <div className="flex flex-wrap gap-3">
              {user.createdTiers.map((tier) => (
                <button
                  key={tier.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-4 py-2 text-primary-foreground hover:bg-primary/90"
                  style={{ backgroundColor: tier.color || "#3b82f6" }}
                  onClick={() => openSubscriptionDialog(tier)}
                >
                  <span>{tier.name}</span>
                  <span>${tier.price.toFixed(2)} / {tier.durationInMonths} month{tier.durationInMonths > 1 ? "s" : ""}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {selectedTier && (
        <SubscriptionDialog
          open={subscriptionDialogOpen}
          onOpenChange={setSubscriptionDialogOpen}
          tier={selectedTier}
          loggedInUser={loggedInUser}
        />
      )}
    </div>
  );
} 