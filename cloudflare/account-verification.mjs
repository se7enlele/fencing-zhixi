import { issueAccountCode, consumeAccountCode, sendAccountCode } from '../tools/account-security.mjs';

// One object per mailbox, serializing check-and-consume across edge regions.
export class AccountVerification {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; this.queue = Promise.resolve(); }
  async fetch(request) {
    const run = async () => {
      try {
        const { operation, identity, purpose, code } = await request.json();
        let result;
        if (operation === 'issue') {
          result = await issueAccountCode(this.ctx.storage, identity, purpose, (to, value, reason) => sendAccountCode(this.env, to, value, reason));
          await this.ctx.storage.setAlarm(Date.now() + 660000);
        } else if (operation === 'consume') {
          await consumeAccountCode(this.ctx.storage, identity, purpose, code);
          result = { ok: true };
        } else return Response.json({ ok: false, message: '操作无效。' }, { status: 400 });
        return Response.json(result);
      } catch(error) { return Response.json({ ok: false, message: error.message }, { status: error.statusCode || 400 }); }
    };
    const pending = this.queue.then(run, run);
    this.queue = pending.then(() => {}, () => {});
    return pending;
  }
  async alarm() { await this.ctx.storage.deleteAll(); }
}
