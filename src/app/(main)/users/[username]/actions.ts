"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { getUserDataSelect } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";

export async function updateUserProfile(values: UpdateUserProfileValues) {
  const validatedValues = updateUserProfileSchema.parse(values);

  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const updatedUser = await prisma.$transaction(async (tx) => {
    // Delete existing tiers that are not in the new list
    await tx.subscriptionTier.deleteMany({
      where: {
        creatorId: user.id,
        id: {
          notIn: values.subscriptionTiers
            .filter((tier): tier is (typeof tier & { id: string }) => !!tier.id)
            .map((tier) => tier.id),
        },
      },
    });

    // Update or create subscription tiers
    const updatedTiers = await Promise.all(
      values.subscriptionTiers.map((tier) =>
        tx.subscriptionTier.upsert({
          where: {
            id: tier.id || "temp-id", // Use a temp id for new tiers
            creatorId: user.id,
          },
          create: {
            name: tier.name,
            description: tier.description,
            price: tier.price,
            creatorId: user.id,
          },
          update: {
            name: tier.name,
            description: tier.description,
            price: tier.price,
          },
        })
      )
    );

    // Update user profile
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        displayName: validatedValues.displayName,
        bio: validatedValues.bio,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        createdTiers: true,
        followers: {
          where: { followerId: user.id },
          select: { followerId: true }
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      }
    });

    return updatedUser;
  });

  return updatedUser;
}

export async function handleExpiredSubscriptions() {
  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
    },
    include: {
      subscriber: true,
      tier: true,
    },
  });

  await Promise.all(
    expiredSubscriptions.map(async (subscription) => {
      // If auto-renew is enabled and subscriber has enough balance, renew the subscription
      if (subscription.autoRenew) {
        const amount = Number(subscription.tier.price);
        // Check if subscriber has enough balance
        if (Number(subscription.subscriber.balance) >= amount) {
          await prisma.$transaction([
            // Deduct from subscriber's balance
            prisma.user.update({
              where: { id: subscription.subscriberId },
              data: {
                balance: {
                  decrement: amount,
                },
              },
            }),
            // Add to creator's balance
            prisma.user.update({
              where: { id: subscription.tier.creatorId },
              data: {
                balance: {
                  increment: amount,
                },
              },
            }),
            // Update subscription expiry
            prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              },
            }),
          ]);
        } else {
          // Not enough balance, disable auto-renew
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              autoRenew: false,
            },
          });
        }
      } else {
        // Delete expired subscription if auto-renew is disabled
        await prisma.subscription.delete({
          where: { id: subscription.id },
        });
      }
    })
  );
}
