import mongoose from "mongoose";

const NewsArticleSchema = new mongoose.Schema({
  title: String,
  summary: String,
  impact: {
    tech: String,
    finance: String,
    retail: String,
  },
  sentiment: {
    type: String,
    enum: ["positive", "negative", "neutral"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  saved: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.models.NewsArticle ||
  mongoose.model("NewsArticle", NewsArticleSchema);
