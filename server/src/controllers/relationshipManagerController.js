import mongoose from 'mongoose';

import User from '../models/User.js';

import {
  Subscription
} from '../models/Platform.js';

import {
  AuditLog,
  RelationshipManagerAssignment
} from '../models/Business.js';

import {
  asyncHandler,
  ApiError,
  ok
} from '../utils/http.js';

const validId = (
  value
) => {
  if (
    !mongoose.isValidObjectId(
      value
    )
  ) {
    throw new ApiError(
      400,
      'Invalid record ID.'
    );
  }
};

const eligibleSubscription =
  (
    userId
  ) => {
    const now =
      new Date();

    return Subscription.findOne({
      user:
        userId,

      status:
        'Active',

      startsAt: {
        $lte:
          now
      },

      endsAt: {
        $gt:
          now
      },

      'entitlementSnapshot.relationshipManager':
        true
    })
      .populate(
        'plan',
        'name slug'
      )
      .sort(
        '-startsAt'
      );
  };

const populatedAssignment =
  (
    id
  ) =>
    RelationshipManagerAssignment.findById(
      id
    )
      .populate(
        'user',
        'email phone status'
      )
      .populate(
        'manager',
        'email phone status role'
      )
      .lean();

export const list =
  asyncHandler(
    async (
      _req,
      res
    ) => {
      const now =
        new Date();

      const [
        managers,
        subscriptions,
        assignments
      ] =
        await Promise.all([
          User.find({
            role:
              'relationship_manager',

            status:
              'Active'
          })
            .select(
              'email phone status'
            )
            .sort(
              'email'
            )
            .lean(),

          Subscription.find({
            status:
              'Active',

            startsAt: {
              $lte:
                now
            },

            endsAt: {
              $gt:
                now
            },

            'entitlementSnapshot.relationshipManager':
              true
          })
            .populate(
              'user',
              'email phone status role'
            )
            .populate(
              'plan',
              'name slug'
            )
            .sort(
              'endsAt'
            )
            .lean(),

          RelationshipManagerAssignment.find()
            .populate(
              'user',
              'email phone status'
            )
            .populate(
              'manager',
              'email phone status role'
            )
            .sort(
              '-assignedAt'
            )
            .lean()
        ]);

      const members =
        subscriptions
          .filter(
            (
              subscription
            ) =>
              subscription
                .user
                ?.role ===
                'member' &&
              subscription
                .user
                ?.status ===
                'Active'
          )
          .map(
            (
              subscription
            ) => {
              const existing =
                assignments.find(
                  (
                    assignment
                  ) =>
                    String(
                      assignment
                        .user
                        ?._id ||
                        assignment.user
                    ) ===
                    String(
                      subscription
                        .user
                        ._id
                    )
                );

              return {
                _id:
                  subscription
                    .user
                    ._id,

                email:
                  subscription
                    .user
                    .email,

                phone:
                  subscription
                    .user
                    .phone,

                plan:
                  subscription
                    .plan
                    ?.name ||
                  subscription
                    .planNameSnapshot ||
                  'Assisted',

                subscriptionEndsAt:
                  subscription.endsAt,

                assignment:
                  existing
                    ? {
                        _id:
                          existing._id,

                        status:
                          existing.status,

                        managerId:
                          existing
                            .manager
                            ?._id ||
                          existing.manager,

                        managerEmail:
                          existing
                            .manager
                            ?.email ||
                          null,

                        notes:
                          existing.notes ||
                          ''
                      }
                    : null
              };
            }
          );

      ok(
        res,
        {
          managers,

          members,

          assignments
        }
      );
    }
  );

export const assign =
  asyncHandler(
    async (
      req,
      res
    ) => {
      validId(
        req.body.user
      );

      validId(
        req.body.manager
      );

      const [
        manager,
        member,
        subscription
      ] =
        await Promise.all([
          User.findOne({
            _id:
              req.body.manager,

            role:
              'relationship_manager',

            status:
              'Active'
          }),

          User.findOne({
            _id:
              req.body.user,

            role:
              'member',

            status:
              'Active'
          }),

          eligibleSubscription(
            req.body.user
          )
        ]);

      if (!manager) {
        throw new ApiError(
          400,
          'Choose an active relationship manager.'
        );
      }

      if (!member) {
        throw new ApiError(
          400,
          'Choose an active member.'
        );
      }

      if (!subscription) {
        throw new ApiError(
          403,
          'Relationship managers can be assigned only to an eligible Assisted member.'
        );
      }

      const notes =
        typeof req.body
          .notes ===
        'string'
          ? req.body.notes
              .trim()
              .slice(
                0,
                2000
              )
          : '';

      const previous =
        await RelationshipManagerAssignment.findOne({
          user:
            member._id
        }).lean();

      const assignment =
        await RelationshipManagerAssignment.findOneAndUpdate(
          {
            user:
              member._id
          },

          {
            $set: {
              user:
                member._id,

              manager:
                manager._id,

              assignedAt:
                new Date(),

              status:
                'Active',

              notes
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

      await AuditLog.create({
        actor:
          req.user.id,

        action:
          previous
            ? 'relationship-manager.reassigned'
            : 'relationship-manager.assigned',

        entityType:
          'RelationshipManagerAssignment',

        entityId:
          String(
            assignment._id
          ),

        metadata: {
          member:
            String(
              member._id
            ),

          previousManager:
            previous
              ?.manager
              ? String(
                  previous.manager
                )
              : null,

          manager:
            String(
              manager._id
            ),

          plan:
            subscription
              .plan
              ?.name ||
            subscription
              .planNameSnapshot,

          status:
            'Active'
        },

        requestId:
          req.id
      });

      /*
       * IMPORTANT:
       *
       * Keep this endpoint's original API contract:
       * assignment.user and assignment.manager
       * are ObjectId values, not populated objects.
       *
       * Existing frontend/backend integrations and
       * tests depend on String(assignment.manager)
       * resolving to the manager ID.
       *
       * The GET endpoint can still return populated
       * assignments for display.
       */
      ok(
        res,
        {
          assignment
        },

        previous
          ? 'Relationship manager reassigned.'
          : 'Relationship manager assigned.'
      );
    }
  );

export const update =
  asyncHandler(
    async (
      req,
      res
    ) => {
      validId(
        req.params.id
      );

      const allowed = [
        'Active',
        'Paused',
        'Ended'
      ];

      if (
        !allowed.includes(
          req.body.status
        )
      ) {
        throw new ApiError(
          400,
          'Invalid assignment status.'
        );
      }

      const assignment =
        await RelationshipManagerAssignment.findById(
          req.params.id
        );

      if (!assignment) {
        throw new ApiError(
          404,
          'Relationship manager assignment not found.'
        );
      }

      if (
        req.body.status ===
        'Active'
      ) {
        const [
          manager,
          subscription
        ] =
          await Promise.all([
            User.findOne({
              _id:
                assignment.manager,

              role:
                'relationship_manager',

              status:
                'Active'
            }),

            eligibleSubscription(
              assignment.user
            )
          ]);

        if (!manager) {
          throw new ApiError(
            409,
            'The assigned relationship manager is not currently active.'
          );
        }

        if (!subscription) {
          throw new ApiError(
            409,
            'The member no longer has an eligible Assisted membership.'
          );
        }
      }

      const previousStatus =
        assignment.status;

      assignment.status =
        req.body.status;

      if (
        typeof req.body
          .notes ===
        'string'
      ) {
        assignment.notes =
          req.body.notes
            .trim()
            .slice(
              0,
              2000
            );
      }

      if (
        req.body.status ===
        'Active'
      ) {
        assignment.assignedAt =
          new Date();
      }

      await assignment.save();

      await AuditLog.create({
        actor:
          req.user.id,

        action:
          'relationship-manager.status-changed',

        entityType:
          'RelationshipManagerAssignment',

        entityId:
          String(
            assignment._id
          ),

        metadata: {
          previousStatus,

          status:
            assignment.status,

          user:
            String(
              assignment.user
            ),

          manager:
            String(
              assignment.manager
            )
        },

        requestId:
          req.id
      });

      /*
       * PATCH is consumed by the newer admin UI,
       * so returning a populated representation here
       * is useful and does not break the legacy PUT
       * assignment contract.
       */
      ok(
        res,
        {
          assignment:
            await populatedAssignment(
              assignment._id
            )
        },

        'Relationship manager assignment updated.'
      );
    }
  );