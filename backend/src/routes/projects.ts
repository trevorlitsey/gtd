import express from "express";
import Project from "../models/Project";
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

// Get all projects for user (with optional search filter)
router.get("/", auth, async (req: any, res: express.Response) => {
  try {
    const filter: any = { user: req.userId };
    if (req.query.q) {
      const regex = new RegExp(req.query.q, "i");
      filter.name = regex;
    }
    const projects = await Project.find(filter).sort({ name: 1 });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects", error });
  }
});

// Get single project by ID
router.get("/:id", auth, async (req: any, res: express.Response) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.userId,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Error fetching project", error });
  }
});

// Create new project
router.post("/", auth, async (req: any, res: express.Response) => {
  try {
    const project = new Project({ ...req.body, user: req.userId });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project", error });
  }
});

// Update project
router.patch("/:id", auth, async (req: any, res: express.Response) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project", error });
  }
});

// Delete project and update associated tasks
router.delete("/:id", auth, async (req: any, res: express.Response) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update all tasks that reference this project to remove the project reference
    await Task.updateMany(
      { user: req.userId, project: req.params.id },
      { $unset: { project: "" } }
    );

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project", error });
  }
});

export default router;
