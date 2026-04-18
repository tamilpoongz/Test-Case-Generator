import mongoose, { Schema, Document, Model } from 'mongoose';
import { JiraIngestMeta } from '../types/index';

export interface IStoredTestCase extends Document {
  testCaseId: string;
  testCaseTitle: string;
  testType: string;
  preconditions: string[];
  testSteps: string[];
  testData: string[];
  expectedResult: string;
  priority: string;
  confidenceScore: number;
  userStoryTitle: string;
  userStoryDescription: string;
  ingestedAt: Date;
  version: number;
  // Optional Jira workflow metadata
  jiraStoryKey?: string;
  jiraProjectKey?: string;
  storySummary?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  evalOverallScore?: number;
  evalVerdict?: 'PASS' | 'WARN' | 'FAIL';
}

const StoredTestCaseSchema = new Schema<IStoredTestCase>({
  testCaseId: { type: String, required: true },
  testCaseTitle: { type: String, required: true },
  testType: { type: String, required: true },
  preconditions: [{ type: String }],
  testSteps: [{ type: String }],
  testData: [{ type: String }],
  expectedResult: { type: String, required: true },
  priority: { type: String, required: true },
  confidenceScore: { type: Number, default: 0.85 },
  userStoryTitle: { type: String, required: true },
  userStoryDescription: { type: String, default: '' },
  ingestedAt: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
  // Optional Jira workflow metadata
  jiraStoryKey: { type: String },
  jiraProjectKey: { type: String },
  storySummary: { type: String },
  reviewStatus: { type: String, enum: ['pending', 'approved', 'rejected'] },
  approvedAt: { type: String },
  evalOverallScore: { type: Number },
  evalVerdict: { type: String, enum: ['PASS', 'WARN', 'FAIL'] },
});

class MongoService {
  private _isConnected: boolean = false;
  private _model: Model<IStoredTestCase> | null = null;

  async connect(): Promise<void> {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/testcase_rag';
    const dbName = process.env.MONGODB_DB_NAME || 'testcase_rag';
    const collectionName = process.env.MONGODB_COLLECTION_NAME || 'test_cases';
    try {
      await mongoose.connect(uri, {
        dbName,
        serverSelectionTimeoutMS: 5000,
      });
      this._isConnected = true;
      this._model =
        (mongoose.models[collectionName] as Model<IStoredTestCase>) ||
        mongoose.model<IStoredTestCase>(collectionName, StoredTestCaseSchema, collectionName);
      console.log(`✓ MongoDB connected — db: "${dbName}", collection: "${collectionName}" — RAG ingestion enabled`);
    } catch (error: any) {
      console.warn('⚠ MongoDB unavailable (RAG ingestion disabled):', error.message);
      this._isConnected = false;
    }
  }

  isConnected(): boolean {
    return this._isConnected && mongoose.connection.readyState === 1;
  }

  async ingestTestCases(
    testCases: any[],
    defaultUserStoryTitle: string,
    defaultUserStoryDescription: string,
    jiraMeta?: JiraIngestMeta
  ): Promise<{ ingested: number; updated: number }> {
    if (!this.isConnected() || !this._model) {
      throw new Error('MongoDB not connected');
    }

    let ingested = 0;
    const updated = 0;

    // Generate a run-unique prefix (e.g. "20260418-143522") so every ingest
    // creates fresh records rather than overwriting existing ones.
    const runPrefix = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 15); // "20260418143522"

    for (const tc of testCases) {
      const storyTitle = tc.userStoryTitle || defaultUserStoryTitle;
      const storyDesc = tc.userStoryDescription || defaultUserStoryDescription;

      // Strip Mongoose internal fields before write
      const { _id, __v, userStoryTitle, userStoryDescription, ingestedAt, version, ...tcData } = tc;

      // Make the ID unique per run so re-ingesting the same story creates
      // new documents instead of updating old ones.
      const uniqueId = `${tcData.testCaseId}-${runPrefix}`;

      await this._model!.create({
        ...tcData,
        testCaseId: uniqueId,
        userStoryTitle: storyTitle,
        userStoryDescription: storyDesc,
        ingestedAt: new Date(),
        version: 1,
        // Spread optional Jira metadata if provided
        ...(jiraMeta || {}),
      });
      ingested++;
    }

    return { ingested, updated };
  }

  async getAllTestCases(): Promise<any[]> {
    if (!this.isConnected() || !this._model) return [];
    return this._model.find().sort({ ingestedAt: -1 }).lean();
  }
}

export default MongoService;
