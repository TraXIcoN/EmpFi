import mongoose from "mongoose";

const NewsArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    sector: {
      type: String,
      enum: ["tech", "finance", "retail", "all"],
      required: true,
    },
    impact: {
      tech: String,
      finance: String,
      retail: String,
    },
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    saved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.NewsArticle ||
  mongoose.model("NewsArticle", NewsArticleSchema);
