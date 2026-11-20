import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export type EvidenceGrade = 'GRADE_A' | 'GRADE_B' | 'GRADE_C';
export type ResearchSource = 'pubmed' | 'crossref' | 'substack';

export interface IResearchCard extends Document<string> {
  _id: string;
  title: string;
  doi?: string;
  pmid?: string;
  authors: string[];
  journal: string;
  publishedYear: number;
  abstract: string;
  keyTakeaways: string[];
  exerciseIds: string[];
  evidenceGrade: EvidenceGrade;
  source: ResearchSource;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchCardSchema = new Schema<IResearchCard>(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    title: {
      type: String,
      required: [true, 'Research title is required'],
      trim: true,
      index: true,
    },
    doi: {
      type: String,
      trim: true,
      index: true,
    },
    pmid: {
      type: String,
      trim: true,
      index: true,
    },
    authors: {
      type: [String],
      default: [],
    },
    journal: {
      type: String,
      default: 'Sports Medicine & Exercise Science',
      trim: true,
    },
    publishedYear: {
      type: Number,
      required: true,
    },
    abstract: {
      type: String,
      required: true,
    },
    keyTakeaways: {
      type: [String],
      required: true,
    },
    exerciseIds: {
      type: [String],
      default: [],
      index: true,
    },
    evidenceGrade: {
      type: String,
      enum: ['GRADE_A', 'GRADE_B', 'GRADE_C'],
      default: 'GRADE_A',
    },
    source: {
      type: String,
      enum: ['pubmed', 'crossref', 'substack'],
      required: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for querying exercise-linked verified cards
ResearchCardSchema.index({ exerciseIds: 1, isVerified: 1 });

export const ResearchCardModel: Model<IResearchCard> =
  mongoose.models.ResearchCard || mongoose.model<IResearchCard>('ResearchCard', ResearchCardSchema);
