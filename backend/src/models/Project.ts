import mongoose from "mongoose";

export interface IProject extends mongoose.Document {
  name: string;
  user: mongoose.Types.ObjectId;
}

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

export default mongoose.model<IProject>("Project", projectSchema);
