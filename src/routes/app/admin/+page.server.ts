import z from 'zod';
import type { Actions } from './$types';
import { logger } from '$lib/utils/logger';
import { fail } from '@sveltejs/kit';
import { FlagDAO } from '$lib/server/db/flag';

export const actions: Actions = {
  create: async ({ request }) => {
    try {
      const formData = Object.fromEntries(await request.formData());
      const schema = z.object({
        chance: z.coerce.number().min(0).max(100),
        description: z.string().min(1),
        key: z.string().min(1),
      });
      const form = schema.safeParse(formData);
      if (!form.success) throw new Error(form.error.issues[0].message);

      const { chance, description, key } = form.data;

      await FlagDAO.createFlag(key, description, chance);

      return {
        action: 'create',
        error: false,
        message: 'successes.admin.createFlag',
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error('Error creating feature flag :', msg);
      return fail(400, {
        action: 'create',
        error: true,
        message: msg || 'errors.server.connectionRefused',
      });
    }
  },
  delete: async ({ request }) => {
    try {
      const formData = Object.fromEntries(await request.formData());
      const schema = z.object({
        key: z.string().min(1),
      });
      const form = schema.safeParse(formData);
      if (!form.success) throw new Error(form.error.issues[0].message);

      const { key } = form.data;

      await FlagDAO.deleteFlag(key);

      return {
        action: 'delete',
        error: false,
        message: 'successes.admin.deleteFlag',
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error('Error deleting feature flag :', msg);
      return fail(400, {
        action: 'delete',
        error: true,
        message: msg || 'errors.server.connectionRefused',
      });
    }
  },
  edit: async ({ request }) => {
    try {
      const formData = Object.fromEntries(await request.formData());
      const schema = z.object({
        chance: z.coerce.number().min(0).max(100),
        description: z.string().min(1),
        key: z.string().min(1),
        originalId: z.string().min(1),
      });
      const form = schema.safeParse(formData);
      if (!form.success) throw new Error(form.error.issues[0].message);
      const { chance, description, key, originalId } = form.data;

      await FlagDAO.editFlag(originalId, key, description, chance);

      return {
        action: 'edit',
        error: false,
        message: 'successes.admin.editFlag',
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error('Error editing feature flag :', msg);
      return fail(400, {
        action: 'edit',
        error: true,
        message: msg || 'errors.server.connectionRefused',
      });
    }
  },
};
