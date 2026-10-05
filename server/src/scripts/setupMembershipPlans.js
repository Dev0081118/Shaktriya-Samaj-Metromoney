import "dotenv/config";

import { connectDatabase } from "../config/database.js";
import { Plan } from "../models/Platform.js";

try {
  await connectDatabase();

  const plans = [
    {
      name: "Free",
      slug: "free",
      price: 0,
      durationDays: 365,
      active: true,
      features: {
        interestLimit: 5,
        contactViewLimit: 0,
        messageLimit: 0,
        advancedSearch: false,
        profileBoost: false,
        prioritySupport: false,
        relationshipManager: false
      }
    },

    {
      name: "Premium",
      slug: "premium",
      price: 549,
      durationDays: 30,
      active: true,
      features: {
        interestLimit: 30,
        contactViewLimit: 10,
        messageLimit: 0,
        advancedSearch: true,
        profileBoost: true,
        prioritySupport: false,
        relationshipManager: false
      }
    },

    {
      name: "Assisted",
      slug: "assisted",
      price: 749,
      durationDays: 30,
      active: true,
      features: {
        interestLimit: 50,
        contactViewLimit: 20,
        messageLimit: 0,
        advancedSearch: true,
        profileBoost: true,
        prioritySupport: true,
        relationshipManager: true
      }
    }
  ];

  for (const plan of plans) {
    await Plan.findOneAndUpdate(
      { slug: plan.slug },
      {
        $set: plan
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true
      }
    );
  }

  await Plan.updateMany(
    {
      slug: {
        $nin: ["free", "premium", "assisted"]
      }
    },
    {
      $set: {
        active: false
      }
    }
  );

  const activePlans = await Plan.find({
    active: true
  })
    .select("name slug price durationDays active features")
    .sort("price");

  console.log("\n======================================");
  console.log("MEMBERSHIP PLANS CONFIGURED");
  console.log("======================================\n");

  for (const plan of activePlans) {
    console.log(
      `${plan.name} | ${plan.slug} | ₹${plan.price} | ${plan.durationDays} days`
    );
  }

  console.log("\n======================================");
  console.log("DONE");
  console.log("======================================\n");

  process.exit(0);
} catch (error) {
  console.error("\nFailed to configure membership plans:");
  console.error(error);

  process.exit(1);
}