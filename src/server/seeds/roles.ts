import { eq } from 'drizzle-orm';
import { roles } from '../db/schema';
import db from '../db';

const seedRoles = async () => {
  const Roles = [
    {
      id: '5d8fde84-524e-4f07-bdf5-f64ed3cb3720',
      name: 'Admin',
      description: 'Care giver with limited access',
    },
    {
      id: '5d8fde84-524e-4f07-bdf5-f64ed3cb3723',
      name: 'User',
      description: 'This is the admin role',
    }
  ];

  for (const role of Roles) {
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, role.id))
      .limit(1);

    if (existingRole.length === 0) {
      await db.insert(roles).values(role).returning();
    } else {
      await db
        .update(roles)
        .set({
          name: role.name,
          description: role.description,
        })
        .where(eq(roles.id, role.id));
    }
  }
};
seedRoles().catch(error => {
  process.exit(1);
});
