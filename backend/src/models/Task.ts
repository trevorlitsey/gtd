import mongoose from "mongoose";

export interface ITask extends mongoose.Document {
  title: string;
  description?: string;
  status: "inbox" | "next" | "waiting" | "scheduled" | "someday" | "done";
  project?: string;
  user: mongoose.Types.ObjectId;
}

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["inbox", "next", "waiting", "scheduled", "someday", "done"],
      default: "inbox",
    },
    project: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>("Task", taskSchema);
