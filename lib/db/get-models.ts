import { connectToDatabase } from "@/lib/db";

/**
 * Connects to the database and returns every model, dynamically imported so a
 * model is never re-registered (which throws under hot reload). Each route
 * handler / server action calls this once.
 */
export async function getModels() {
  await connectToDatabase();

  const [
    userMod,
    productMod,
    orderMod,
    reviewMod,
    notificationMod,
    couponMod,
    bannerMod,
    subscriberMod,
    settingMod,
    categoryMod,
    shopMod,
    eventMod,
  ] = await Promise.all([
    import("@/lib/db/models/user.model"),
    import("@/lib/db/models/product.model"),
    import("@/lib/db/models/order.model"),
    import("@/lib/db/models/review.model"),
    import("@/lib/db/models/notification.model"),
    import("@/lib/db/models/coupon.model"),
    import("@/lib/db/models/banner.model"),
    import("@/lib/db/models/subscriber.model"),
    import("@/lib/db/models/setting.model"),
    import("@/lib/db/models/category.model"),
    import("@/lib/db/models/shop.model"),
    import("@/lib/db/models/event.model"),
  ]);

  return {
    User: userMod.default,
    Product: productMod.default,
    Order: orderMod.default,
    Review: reviewMod.default,
    Notification: notificationMod.default,
    Coupon: couponMod.default,
    Banner: bannerMod.default,
    Subscriber: subscriberMod.default,
    Setting: settingMod.default,
    Category: categoryMod.default,
    Shop: shopMod.default,
    Event: eventMod.default,
    recalcProductRating: reviewMod.recalcProductRating,
  };
}
