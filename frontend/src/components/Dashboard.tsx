import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "inbox" | "next" | "waiting" | "scheduled" | "someday" | "done";
  context?: string;
  project?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "inbox",
    priority: "medium",
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleOpen = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setNewTask(task);
    } else {
      setEditingTask(null);
      setNewTask({
        title: "",
        description: "",
        status: "inbox",
        priority: "medium",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
    setNewTask({
      title: "",
      description: "",
      status: "inbox",
      priority: "medium",
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingTask) {
        await axios.patch(
          `http://localhost:5001/api/tasks/${editingTask._id}`,
          newTask
        );
      } else {
        await axios.post("http://localhost:5001/api/tasks", newTask);
      }
      handleClose();
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await axios.delete(`http://localhost:5001/api/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.name}!
          </Typography>
        </Grid>
        {["inbox", "next", "waiting", "scheduled", "someday"].map((status) => (
          <Grid item xs={12} md={6} lg={4} key={status}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 400,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Typography>
              <List>
                {getTasksByStatus(status as Task["status"]).map((task) => (
                  <ListItem key={task._id}>
                    <ListItemText
                      primary={task.title}
                      secondary={task.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpen(task)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(task._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpen()}
        sx={{ position: "fixed", bottom: 20, right: 20 }}
      >
        Add Task
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={newTask.status}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  status: e.target.value as Task["status"],
                })
              }
            >
              <MenuItem value="inbox">Inbox</MenuItem>
              <MenuItem value="next">Next Actions</MenuItem>
              <MenuItem value="waiting">Waiting For</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="someday">Someday/Maybe</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as Task["priority"],
                })
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingTask ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
