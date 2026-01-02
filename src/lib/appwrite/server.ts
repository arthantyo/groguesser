"use server";

import {
  Account,
  Avatars,
  Client,
  Databases,
  TablesDB,
  Users,
  Storage,
} from "node-appwrite";

let adminClient: Client | null = null;
let services: {
  account: Account;
  database: Databases;
  avatars: Avatars;
  storage: Storage;
  users: Users;
  tables: TablesDB;
} | null = null;

export async function getAdminServices() {
  if (services) {
    return services;
  }

  if (!adminClient) {
    adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT as string)
      .setKey(process.env.NEXT_APPWRITE_KEY as string);
  }

  services = {
    account: new Account(adminClient),
    database: new Databases(adminClient),
    avatars: new Avatars(adminClient),
    storage: new Storage(adminClient),
    users: new Users(adminClient),
    tables: new TablesDB(adminClient),
  };

  return services;
}
