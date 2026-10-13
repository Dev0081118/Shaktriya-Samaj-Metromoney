import {
  Router
} from 'express';

import {
  protect,
  permit,
  maintenanceGuard
} from '../middleware/auth.js';

import {
  activateBoost,
  adminOverview,
  boostStatus,
  createPackOrder,
  publicBoostPacks,
  publicBoostPlanConfigs,
  saveBoostPack,
  savePlanConfig,
  verifyPackPayment
} from '../controllers/boostController.js';

const router =
  Router();

const member = [
  protect,
  maintenanceGuard
];

const superAdmin = [
  protect,
  permit(
    'super_admin'
  )
];

/*
 * Public commercial information.
 */
router.get(
  '/public/boost-packs',
  publicBoostPacks
);

router.get(
  '/public/boost-plan-configs',
  publicBoostPlanConfigs
);

/*
 * Member wallet + activation.
 *
 * These intentionally shadow the old /profile-boost
 * implementation when boostRoutes is mounted before
 * the main legacy router.
 */
router.get(
  '/profile-boost',
  ...member,
  boostStatus
);

router.post(
  '/profile-boost',
  ...member,
  activateBoost
);

/*
 * Individual boost-pack checkout.
 */
router.post(
  '/boost-packs/:slug/order',
  ...member,
  createPackOrder
);

router.post(
  '/boost-packs/verify',
  ...member,
  verifyPackPayment
);

/*
 * Super Admin boost configuration.
 */
router.get(
  '/admin/boost-management',
  ...superAdmin,
  adminOverview
);

router.put(
  '/admin/boost-plan-configs/:planId',
  ...superAdmin,
  savePlanConfig
);

router.post(
  '/admin/boost-packs',
  ...superAdmin,
  saveBoostPack
);

router.patch(
  '/admin/boost-packs/:id',
  ...superAdmin,
  saveBoostPack
);

export default router;