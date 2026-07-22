import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

import {
  MarketingAudience,
  MarketingEmailRecipient,
} from "../../application/ports/marketing-audience";

/** Lista quem deu opt-in de e-mails de marketing (usersTable.marketingEmailsOptIn). */
export class DrizzleMarketingAudience implements MarketingAudience {
  async listOptedInRecipients(): Promise<MarketingEmailRecipient[]> {
    const rows = await db.query.usersTable.findMany({
      where: eq(usersTable.marketingEmailsOptIn, true),
      columns: { email: true, name: true },
    });

    return rows.map((row) => ({ email: row.email, name: row.name }));
  }
}
