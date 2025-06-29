import express from "express";
import Task from "../models/Task";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT token
const auth = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error();

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate" });
  }
};

// Get all tasks for user (with optional status and search filter)
router.get("/", auth, async (req: any, res: express.Response) => {
  try {
    const filter: any = { user: req.userId };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.q) {
      const regex = new RegExp(req.query.q, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }
    const tasks = await Task.find(filter).populate("project", "name");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});

// Create new task
router.post("/", auth, async (req: any, res: express.Response) => {
  try {
    const task = new Task({ ...req.body, user: req.userId });
    await task.save();
    const populatedTask = await Task.findById(task._id).populate(
      "project",
      "name"
    );
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error });
  }
});

// Update task
router.patch("/:id", auth, async (req: any, res: express.Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    ).populate("project", "name");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
});

// Delete task
router.delete("/:id", auth, async (req: any, res: express.Response) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
});

export default router;
