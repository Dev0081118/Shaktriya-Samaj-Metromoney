import mongoose from 'mongoose';

import {
  Plan
} from '../models/Platform.js';

import {
  BoostPack,
  BoostPlanConfig,
  BoostOrder
} from '../models/Boost.js';

import {
  paymentService
} from '../services/paymentService.js';

import {
  activateBoostOrder,
  activateProfileBoost,
  getBoostWallet,
  validateBoostPayment
} from '../services/boostService.js';

import {
  getSystemSettings
} from '../services/systemService.js';

import {
  ApiError,
  asyncHandler,
  ok
} from '../utils/http.js';

const cleanSlug =
  (
    value
  ) =>
    String(
      value ||
        ''
    )
      .trim()
      .toLowerCase();

const integer =
  (
    value,
    fallback
  ) => {
    const parsed =
      Number(
        value
      );

    return Number.isInteger(
      parsed
    )
      ? parsed
      : fallback;
  };

const validatePackPayload =
  (
    body,
    existing = null
  ) => {
    const name =
      body.name !==
        undefined
        ? String(
            body.name
          ).trim()
        : existing?.name;

    const slug =
      body.slug !==
        undefined
        ? cleanSlug(
            body.slug
          )
        : existing?.slug;

    const price =
      body.price !==
        undefined
        ? Number(
            body.price
          )
        : existing?.price;

    const credits =
      body.credits !==
        undefined
        ? integer(
            body.credits
          )
        : existing?.credits;

    const durationHours =
      body.durationHours !==
        undefined
        ? integer(
            body.durationHours
          )
        : existing?.durationHours;

    if (
      !name ||
      !slug
    ) {
      throw new ApiError(
        400,
        'Boost pack name and slug are required.'
      );
    }

    if (
      !/^[a-z0-9-]+$/.test(
        slug
      )
    ) {
      throw new ApiError(
        400,
        'Boost pack slug may contain lowercase letters, numbers and hyphens only.'
      );
    }

    if (
      !Number.isFinite(
        price
      ) ||
      price <=
        0
    ) {
      throw new ApiError(
        400,
        'Boost pack price must be greater than zero.'
      );
    }

    if (
      !Number.isInteger(
        credits
      ) ||
      credits <
        1 ||
      credits >
        1000
    ) {
      throw new ApiError(
        400,
        'Boost credits must be between 1 and 1000.'
      );
    }

    if (
      !Number.isInteger(
        durationHours
      ) ||
      durationHours <
        1 ||
      durationHours >
        168
    ) {
      throw new ApiError(
        400,
        'Boost duration must be between 1 and 168 hours.'
      );
    }

    return {
      name,
      slug,
      price,
      credits,
      durationHours,

      active:
        body.active !==
          undefined
          ? body.active ===
            true
          : existing?.active ??
            true,

      sortOrder:
        body.sortOrder !==
          undefined
          ? integer(
              body.sortOrder,
              0
            )
          : existing?.sortOrder ??
            0
    };
  };

export const publicBoostPacks =
  asyncHandler(
    async (
      _req,
      res
    ) => {
      const packs =
        await BoostPack.find({
          active:
            true
        })
          .sort({
            sortOrder:
              1,

            price:
              1
          })
          .lean();

      ok(
        res,
        {
          packs
        }
      );
    }
  );

export const publicBoostPlanConfigs =
  asyncHandler(
    async (
      _req,
      res
    ) => {
      const configs =
        await BoostPlanConfig.find({
          active:
            true,

          includedCredits: {
            $gt:
              0
          }
        })
          .populate(
            'plan',
            'name slug'
          )
          .lean();

      ok(
        res,
        {
          configs:
            configs
              .filter(
                (
                  item
                ) =>
                  item.plan
              )
              .map(
                (
                  item
                ) => ({
                  planId:
                    item.plan
                      ._id,

                  planName:
                    item.plan
                      .name,

                  planSlug:
                    item.plan
                      .slug,

                  includedCredits:
                    item
                      .includedCredits,

                  durationHours:
                    item
                      .durationHours
                })
              )
        }
      );
    }
  );

export const boostStatus =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const [
        wallet,
        packs
      ] =
        await Promise.all([
          getBoostWallet(
            req.user.id
          ),

          BoostPack.find({
            active:
              true
          })
            .sort({
              sortOrder:
                1,

              price:
                1
            })
            .lean()
        ]);

      ok(
        res,
        {
          wallet,
          packs
        }
      );
    }
  );

export const activateBoost =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const result =
        await activateProfileBoost(
          req.user.id
        );

      const wallet =
        await getBoostWallet(
          req.user.id
        );

      ok(
        res,
        {
          activation:
            result.activation,

          wallet
        },

        'Profile boost activated.',

        201
      );
    }
  );

export const createPackOrder =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const settings =
        await getSystemSettings();

      if (
        !settings.paymentsEnabled
      ) {
        throw new ApiError(
          503,
          'Payments are temporarily unavailable.'
        );
      }

      const pack =
        await BoostPack.findOne({
          slug:
            cleanSlug(
              req.params.slug
            ),

          active:
            true
        });

      if (!pack) {
        throw new ApiError(
          404,
          'Boost pack not found.'
        );
      }

      const recent =
        await BoostOrder.findOne({
          user:
            req.user.id,

          pack:
            pack._id,

          provider:
            'razorpay',

          status:
            'Created',

          createdAt: {
            $gte:
              new Date(
                Date.now() -
                  15 *
                    60 *
                    1000
              )
          }
        }).sort(
          '-createdAt'
        );

      if (
        recent
          ?.providerOrderId
      ) {
        return ok(
          res,
          {
            order: {
              provider:
                recent.provider,

              providerOrderId:
                recent
                  .providerOrderId,

              amount:
                recent.amount,

              currency:
                recent.currency,

              keyId:
                process.env
                  .RAZORPAY_KEY_ID,

              name:
                recent
                  .packNameSnapshot,

              credits:
                recent
                  .creditsSnapshot,

              durationHours:
                recent
                  .durationHoursSnapshot
            }
          },

          'Existing boost payment order reused.'
        );
      }

      const providerOrder =
        await paymentService.createOrder({
          amount:
            pack.price,

          user:
            req.user.id,

          receipt:
            `boost_${req.user.id}_${Date.now()}`
        });

      const order =
        await BoostOrder.create({
          user:
            req.user.id,

          pack:
            pack._id,

          packNameSnapshot:
            pack.name,

          creditsSnapshot:
            pack.credits,

          durationHoursSnapshot:
            pack.durationHours,

          amount:
            providerOrder.amount,

          currency:
            providerOrder.currency,

          provider:
            providerOrder.provider,

          providerOrderId:
            providerOrder
              .providerOrderId,

          status:
            'Created'
        });

      ok(
        res,
        {
          order: {
            ...providerOrder,

            name:
              pack.name,

            credits:
              pack.credits,

            durationHours:
              pack
                .durationHours
          },

          boostOrder:
            order
        },

        'Boost payment order created.',

        201
      );
    }
  );

export const verifyPackPayment =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        razorpay_order_id:
          orderId,

        razorpay_payment_id:
          paymentId,

        razorpay_signature:
          signature
      } =
        req.body;

      if (
        !orderId ||
        !paymentId ||
        !signature
      ) {
        throw new ApiError(
          400,
          'Complete boost payment verification details are required.'
        );
      }

      const order =
        await BoostOrder.findOne({
          providerOrderId:
            orderId,

          user:
            req.user.id
        });

      if (!order) {
        throw new ApiError(
          404,
          'Boost payment order not found.'
        );
      }

      paymentService.verifyCheckout({
        orderId,
        paymentId,
        signature
      });

      if (
        order.providerPaymentId &&
        order.providerPaymentId !==
          paymentId
      ) {
        throw new ApiError(
          409,
          'Boost payment identifier does not match.'
        );
      }

      const providerPayment =
        await paymentService.fetchPayment(
          paymentId
        );

      validateBoostPayment(
        order,
        providerPayment
      );

      if (
        providerPayment.id !==
          paymentId
      ) {
        throw new ApiError(
          409,
          'Payment provider returned a different payment identifier.'
        );
      }

      if (
        providerPayment.status !==
          'captured'
      ) {
        throw new ApiError(
          409,
          'Boost payment has not been captured yet.'
        );
      }

      await activateBoostOrder(
        order,
        paymentId
      );

      const wallet =
        await getBoostWallet(
          req.user.id
        );

      ok(
        res,
        {
          wallet
        },

        'Boost credits added successfully.'
      );
    }
  );

export const adminOverview =
  asyncHandler(
    async (
      _req,
      res
    ) => {
      const [
        plans,
        configs,
        packs
      ] =
        await Promise.all([
          Plan.find()
            .select(
              'name slug price durationDays active'
            )
            .sort(
              'price'
            )
            .lean(),

          BoostPlanConfig.find()
            .lean(),

          BoostPack.find()
            .sort({
              sortOrder:
                1,

              price:
                1
            })
            .lean()
        ]);

      const configMap =
        new Map(
          configs.map(
            (
              config
            ) => [
              String(
                config.plan
              ),

              config
            ]
          )
        );

      ok(
        res,
        {
          plans:
            plans.map(
              (
                plan
              ) => ({
                ...plan,

                boostConfig:
                  configMap.get(
                    String(
                      plan._id
                    )
                  ) ||
                  null
              })
            ),

          packs
        }
      );
    }
  );

export const savePlanConfig =
  asyncHandler(
    async (
      req,
      res
    ) => {
      if (
        !mongoose.isValidObjectId(
          req.params.planId
        )
      ) {
        throw new ApiError(
          400,
          'Invalid plan ID.'
        );
      }

      const plan =
        await Plan.findById(
          req.params.planId
        );

      if (!plan) {
        throw new ApiError(
          404,
          'Membership plan not found.'
        );
      }

      const includedCredits =
        integer(
          req.body
            .includedCredits
        );

      const durationHours =
        integer(
          req.body
            .durationHours
        );

      if (
        !Number.isInteger(
          includedCredits
        ) ||
        includedCredits <
          0 ||
        includedCredits >
          1000
      ) {
        throw new ApiError(
          400,
          'Included boost credits must be between 0 and 1000.'
        );
      }

      if (
        !Number.isInteger(
          durationHours
        ) ||
        durationHours <
          1 ||
        durationHours >
          168
      ) {
        throw new ApiError(
          400,
          'Boost duration must be between 1 and 168 hours.'
        );
      }

      const config =
        await BoostPlanConfig.findOneAndUpdate(
          {
            plan:
              plan._id
          },

          {
            $set: {
              includedCredits,

              durationHours,

              active:
                req.body.active !==
                  false
            }
          },

          {
            upsert:
              true,

            returnDocument:
              'after',

            runValidators:
              true
          }
        );

      ok(
        res,
        {
          config
        },

        'Plan boost configuration saved.'
      );
    }
  );

export const saveBoostPack =
  asyncHandler(
    async (
      req,
      res
    ) => {
      let existing =
        null;

      if (
        req.params.id
      ) {
        if (
          !mongoose.isValidObjectId(
            req.params.id
          )
        ) {
          throw new ApiError(
            400,
            'Invalid boost pack ID.'
          );
        }

        existing =
          await BoostPack.findById(
            req.params.id
          );

        if (!existing) {
          throw new ApiError(
            404,
            'Boost pack not found.'
          );
        }
      }

      const safe =
        validatePackPayload(
          req.body,
          existing
        );

      const pack =
        existing
          ? await BoostPack.findByIdAndUpdate(
              existing._id,

              {
                $set:
                  safe
              },

              {
                returnDocument:
                  'after',

                runValidators:
                  true
              }
            )
          : await BoostPack.create(
              safe
            );

      ok(
        res,
        {
          pack
        },

        'Boost pack saved.',

        existing
          ? 200
          : 201
      );
    }
  );