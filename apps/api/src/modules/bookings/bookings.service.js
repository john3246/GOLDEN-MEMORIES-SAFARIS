import { createId } from '@gm-safaris/shared-utils';
import { notFound, validationError } from '../../errors/index.js';
import { readStore, updateStore } from '../../cms-store/index.js';
import { recordAudit } from '../audit/audit.service.js';

function now() {
  return new Date().toISOString();
}

function code() {
  return `BK-${String(Date.now()).slice(-6)}`;
}

export const bookingsService = {
  async list() {
    const store = await readStore();
    return { data: store.bookings || [], meta: { total: (store.bookings || []).length } };
  },

  async create(body, actor) {
    const customerName = String(body.customerName || body.name || '').trim();
    const safariTitle = String(body.safariTitle || body.package || '').trim();
    if (!customerName || !safariTitle) {
      throw validationError('Guest name and tour package are required');
    }
    const record = {
      id: createId(),
      code: body.code || code(),
      customerName,
      email: String(body.email || '').trim(),
      phone: String(body.phone || '').trim(),
      safariTitle,
      safariId: body.safariId || '',
      travelDate: body.travelDate || '',
      status: body.status || 'Pending',
      amount: Number(body.amount || 0),
      created_at: now(),
      updated_at: now(),
    };
    await updateStore((store) => {
      if (!Array.isArray(store.bookings)) store.bookings = [];
      store.bookings.unshift(record);
      if (record.email) {
        if (!Array.isArray(store.customers)) store.customers = [];
        if (!store.customers.some((item) => item.email === record.email)) {
          store.customers.unshift({
            id: createId(),
            name: customerName,
            email: record.email,
            phone: record.phone,
            created_at: now(),
            updated_at: now(),
          });
        }
      }
    });
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'booking.create',
      resource: 'bookings',
      resourceId: record.id,
    });
    return record;
  },

  async update(id, body, actor) {
    const record = await updateStore((store) => {
      const item = (store.bookings || []).find((row) => row.id === id);
      if (!item) return null;
      Object.assign(item, {
        customerName: body.customerName ?? item.customerName,
        email: body.email ?? item.email,
        safariTitle: body.safariTitle ?? item.safariTitle,
        travelDate: body.travelDate ?? item.travelDate,
        status: body.status ?? item.status,
        amount: body.amount != null ? Number(body.amount) : item.amount,
        updated_at: now(),
      });
      return item;
    });
    if (!record) throw notFound('Booking not found');
    await recordAudit({
      actorId: actor?.userId,
      actorEmail: actor?.email,
      action: 'booking.update',
      resource: 'bookings',
      resourceId: id,
    });
    return record;
  },

  async listCustomers() {
    const store = await readStore();
    return { data: store.customers || [], meta: { total: (store.customers || []).length } };
  },
};
