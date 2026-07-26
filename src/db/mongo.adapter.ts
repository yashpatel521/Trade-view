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
  return mongoDbInstance;
}

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

  // 1. Drizzle BinaryOperator: eq(col, val) or ne(col, val)
  if (typeof where === 'object' && where.left && where.right !== undefined) {
    let key = where.left.name || where.left.key || 'id';
    if (key === 'user_id') key = 'userId';
    if (key === 'password_hash') key = 'passwordHash';
    if (key === 'cash_balance') key = 'cashBalance';
    if (key === 'is_public') key = 'isPublic';
    if (key === 'created_at') key = 'createdAt';
    if (key === 'updated_at') key = 'updatedAt';
    if (key === 'profit_loss') key = 'profitLoss';

    const val = cleanBsonObject(where.right);
    if (where.operator === '!=' || where.operator === '<>') {
      return { [key]: { $ne: val } };
    }
    return { [key]: val };
  }

  // 2. Drizzle AND / OR clauses
  if (Array.isArray(where.conditions)) {
    const filters = where.conditions.map((c: any) => parseWhereClause(c));
    return { $and: filters };
  }

  // 3. Fallback: inspect queryChunks
  if (Array.isArray(where.queryChunks)) {
    const filter: any = {};
    for (const chunk of where.queryChunks) {
      if (chunk && chunk.left && chunk.right !== undefined) {
        let key = chunk.left.name || chunk.left.key || 'id';
        if (key === 'user_id') key = 'userId';
        if (key === 'password_hash') key = 'passwordHash';
        if (key === 'cash_balance') key = 'cashBalance';
        if (key === 'is_public') key = 'isPublic';
        filter[key] = cleanBsonObject(chunk.right);
      }
    }
    return filter;
  }

  // 4. Plain object
  if (typeof where === 'object') {
    return cleanBsonObject(where);
  }

  return {};
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
        async values(vals: any) {
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
