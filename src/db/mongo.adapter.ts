import { MongoClient, Db } from 'mongodb';

let mongoDbInstance: Db | null = null;
let mongoClientInstance: MongoClient | null = null;

export async function getMongoDb(url: string): Promise<Db> {
  if (mongoDbInstance) return mongoDbInstance;
  
  mongoClientInstance = new MongoClient(url);
  await mongoClientInstance.connect();
  
  let dbName = 'trade_view';
  try {
    const parsedUrl = new URL(url.startsWith('mongodb') ? url : `mongodb://${url}`);
    dbName = parsedUrl.pathname.replace('/', '') || 'trade_view';
  } catch {
    dbName = 'trade_view';
  }
  
  mongoDbInstance = mongoClientInstance.db(dbName);
  console.log(`[MongoDB Adapter] Connected successfully to database: "${dbName}"`);

  // Explicitly ensure collections exist in MongoDB
  const targetCollections = ['users', 'holdings', 'trades', 'daily_logs'];
  try {
    const existing = await mongoDbInstance.listCollections().toArray();
    const existingNames = new Set(existing.map((c) => c.name));
    for (const colName of targetCollections) {
      if (!existingNames.has(colName)) {
        await mongoDbInstance.createCollection(colName);
        console.log(`[MongoDB Adapter] Created collection: "${colName}"`);
      }
    }

    // Ensure default admin user exists in MongoDB
    const usersCol = mongoDbInstance.collection('users');
    const existingAdmin = await usersCol.findOne({ email: 'admin@trading.com' });
    if (!existingAdmin) {
      console.log('[MongoDB Adapter] Seeding default admin user into MongoDB...');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const bcrypt = require('bcryptjs');
      const passwordHash = bcrypt.hashSync('admin', 10);
      await usersCol.insertOne({
        id: 1,
        name: 'Default Admin',
        email: 'admin@trading.com',
        passwordHash,
        role: 'admin',
        cashBalance: 10000,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('[MongoDB Adapter] Default admin user (admin@trading.com) successfully seeded!');
    }
  } catch (err) {
    console.error('[MongoDB Adapter] Error ensuring collections & admin user exist:', err);
  }

  return mongoDbInstance;
}

const VALID_FIELD_MAP: Record<string, string> = {
  id: 'id',
  name: 'name',
  email: 'email',
  password_hash: 'passwordHash',
  passwordHash: 'passwordHash',
  role: 'role',
  cash_balance: 'cashBalance',
  cashBalance: 'cashBalance',
  is_public: 'isPublic',
  isPublic: 'isPublic',
  created_at: 'createdAt',
  createdAt: 'createdAt',
  updated_at: 'updatedAt',
  updatedAt: 'updatedAt',
  user_id: 'userId',
  userId: 'userId',
  ticker: 'ticker',
  shares: 'shares',
  average_price: 'averagePrice',
  averagePrice: 'averagePrice',
  price: 'price',
  currency: 'currency',
  type: 'type',
  date: 'date',
  profit_loss: 'profitLoss',
  profitLoss: 'profitLoss',
  note: 'note',
};

export function cleanBsonObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val === undefined || typeof val === 'function') continue;
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        clean[key] = val;
      }
    }
    return clean;
  }
}

export function parseWhereClause(where: any): any {
  if (!where) return {};

  const filter: any = {};

  // 1. Direct object with left & right (BinaryOperator)
  if (typeof where === 'object' && where.left && where.right !== undefined) {
    const rawKey = where.left.name || where.left.key || 'id';
    const key = VALID_FIELD_MAP[rawKey] || rawKey;
    const val = cleanBsonObject(where.right);
    if (where.operator === '!=' || where.operator === '<>') {
      return { [key]: { $ne: val } };
    }
    return { [key]: val };
  }

  // 2. Drizzle AND / OR clauses with conditions
  if (Array.isArray(where.conditions)) {
    const filters = where.conditions.map((c: any) => parseWhereClause(c));
    return { $and: filters };
  }

  // 3. Drizzle queryChunks array
  if (Array.isArray(where.queryChunks)) {
    let lastKey: string | null = null;
    for (const chunk of where.queryChunks) {
      if (!chunk) continue;
      if (chunk.name && VALID_FIELD_MAP[chunk.name]) {
        lastKey = VALID_FIELD_MAP[chunk.name];
      } else if (chunk.left && chunk.left.name && VALID_FIELD_MAP[chunk.left.name]) {
        lastKey = VALID_FIELD_MAP[chunk.left.name];
        if (chunk.right !== undefined) {
          filter[lastKey] = cleanBsonObject(chunk.right);
          lastKey = null;
        }
      } else if (chunk.value !== undefined && lastKey) {
        filter[lastKey] = cleanBsonObject(chunk.value);
        lastKey = null;
      }
    }
    if (Object.keys(filter).length > 0) {
      return filter;
    }
  }

  // 4. Plain JS object filter (e.g. { email: 'user@example.com' })
  if (typeof where === 'object') {
    for (const rawKey of Object.keys(where)) {
      if (VALID_FIELD_MAP[rawKey]) {
        const key = VALID_FIELD_MAP[rawKey];
        filter[key] = cleanBsonObject(where[rawKey]);
      }
    }
    if (Object.keys(filter).length > 0) {
      return filter;
    }
  }

  // If a where clause was provided but could not be parsed, return a non-matching query
  return { _id: '__NO_MATCH_FILTER__' };
}

function getCollectionName(table: any): string {
  if (typeof table === 'string') return table;
  const name = table?.tableName || table?.name || table?._?.name || 'users';
  if (name === 'daily_logs') return 'daily_logs';
  return name;
}

export function createMongoDbAdapter(url: string) {
  const getDb = () => getMongoDb(url);

  const createCollectionApi = (colName: string) => ({
    async findFirst(opts?: any) {
      const db = await getDb();
      const col = db.collection(colName);
      const filter = parseWhereClause(opts?.where);
      const doc = await col.findOne(filter);
      if (!doc) return null;
      return { id: doc.id || doc._id.toString(), ...doc };
    },
    async findMany(opts?: any) {
      const db = await getDb();
      const col = db.collection(colName);
      const filter = parseWhereClause(opts?.where);
      let cursor = col.find(filter);
      if (opts?.limit) cursor = cursor.limit(opts.limit);
      const docs = await cursor.toArray();
      return docs.map(d => ({ id: d.id || d._id.toString(), ...d }));
    }
  });

  return {
    driverType: 'mongodb' as const,
    query: {
      users: createCollectionApi('users'),
      holdings: createCollectionApi('holdings'),
      trades: createCollectionApi('trades'),
      dailyLogs: createCollectionApi('daily_logs'),
    },
    insert(table: any) {
      const colName = getCollectionName(table);
      return {
        values(vals: any) {
          const promise = (async () => {
            const db = await getDb();
            const col = db.collection(colName);
            const valArray = Array.isArray(vals) ? vals : [vals];
            const docs = valArray.map((v, i) => {
              const cleanV = cleanBsonObject(v);
              return {
                id: cleanV.id || Date.now() + i,
                createdAt: new Date(),
                updatedAt: new Date(),
                ...cleanV,
              };
            });
            await col.insertMany(docs);
            return docs;
          })();

          (promise as any).returning = () => promise;
          return promise;
        }
      };
    },
    update(table: any) {
      const colName = getCollectionName(table);
      return {
        set(vals: any) {
          return {
            async where(whereClause: any) {
              const db = await getDb();
              const col = db.collection(colName);
              const filter = parseWhereClause(whereClause);
              const cleanVals = cleanBsonObject(vals);
              await col.updateMany(filter, { $set: cleanVals });
              return { success: true };
            }
          };
        }
      };
    },
    delete(table: any) {
      const colName = getCollectionName(table);
      return {
        async where(whereClause: any) {
          const db = await getDb();
          const col = db.collection(colName);
          const filter = parseWhereClause(whereClause);
          await col.deleteMany(filter);
          return { success: true };
        }
      };
    }
  };
}
