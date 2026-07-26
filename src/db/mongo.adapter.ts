import { MongoClient, Db } from 'mongodb';

let mongoDbInstance: Db | null = null;
let mongoClientInstance: MongoClient | null = null;

export async function getMongoDb(url: string): Promise<Db> {
  if (mongoDbInstance) return mongoDbInstance;
  
  mongoClientInstance = new MongoClient(url);
  await mongoClientInstance.connect();
  
  // Parse DB name or default to 'trade_view'
  const dbName = new URL(url).pathname.replace('/', '') || 'trade_view';
  mongoDbInstance = mongoClientInstance.db(dbName);
  console.log(`[MongoDB Adapter] Connected successfully to database: "${dbName}"`);
  return mongoDbInstance;
}

export function createMongoDbAdapter(url: string) {
  const getDb = () => getMongoDb(url);

  return {
    driverType: 'mongodb' as const,
    query: {
      users: {
        async findFirst(opts?: any) {
          const db = await getDb();
          const col = db.collection('users');
          let filter: any = {};
          if (opts?.where) {
            filter = opts.where;
          }
          const doc = await col.findOne(filter);
          if (!doc) return null;
          return { id: doc.id || doc._id.toString(), ...doc };
        },
        async findMany(opts?: any) {
          const db = await getDb();
          const col = db.collection('users');
          let filter: any = {};
          if (opts?.where) filter = opts.where;
          const docs = await col.find(filter).toArray();
          return docs.map(d => ({ id: d.id || d._id.toString(), ...d }));
        }
      },
      holdings: {
        async findFirst(opts?: any) {
          const db = await getDb();
          const col = db.collection('holdings');
          let filter: any = {};
          if (opts?.where) filter = opts.where;
          const doc = await col.findOne(filter);
          if (!doc) return null;
          return { id: doc.id || doc._id.toString(), ...doc };
        },
        async findMany(opts?: any) {
          const db = await getDb();
          const col = db.collection('holdings');
          let filter: any = {};
          if (opts?.where) filter = opts.where;
          const docs = await col.find(filter).toArray();
          return docs.map(d => ({ id: d.id || d._id.toString(), ...d }));
        }
      },
      trades: {
        async findFirst(opts?: any) {
          const db = await getDb();
          const col = db.collection('trades');
          let filter: any = {};
          if (opts?.where) filter = opts.where;
          const doc = await col.findOne(filter);
          if (!doc) return null;
          return { id: doc.id || doc._id.toString(), ...doc };
        },
        async findMany(opts?: any) {
          const db = await getDb();
          const col = db.collection('trades');
          let filter: any = {};
          if (opts?.where) filter = opts.where;
          let cursor = col.find(filter);
          if (opts?.limit) cursor = cursor.limit(opts.limit);
          const docs = await cursor.toArray();
          return docs.map(d => ({ id: d.id || d._id.toString(), ...d }));
        }
      },
      dailyLogs: {
        async findFirst(opts?: any) {
          const db = await getDb();
          const col = db.collection('daily_logs');
          let filter: any = {};
          if (opts?.where) filter = opts.where;
          const doc = await col.findOne(filter);
          if (!doc) return null;
          return { id: doc.id || doc._id.toString(), ...doc };
        },
        async findMany(opts?: any) {
          const db = await getDb();
          const col = db.collection('daily_logs');
          let filter: any = {};
          if (opts?.where) filter = opts.where;
          let cursor = col.find(filter);
          if (opts?.limit) cursor = cursor.limit(opts.limit);
          const docs = await cursor.toArray();
          return docs.map(d => ({ id: d.id || d._id.toString(), ...d }));
        }
      }
    }
  };
}
