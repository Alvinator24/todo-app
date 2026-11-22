const request = require("supertest");
const app = require("../server");
const pool = require("../db");

jest.mock("../db");

describe("Task API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/tasks
  describe("GET /api/tasks", () => {
    test("should return all tasks", async () => {
      const mockTasks = [
        {
          id: 1,
          title: "Task 1",
          description: "First task",
          completed: false
        },
        {
          id: 2,
          title: "Task 2",
          description: "Second task",
          completed: true
        }
      ];

      pool.query.mockResolvedValue({
        rows: mockTasks
      });

      const response = await request(app)
        .get("/api/tasks");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test("should return 500 if database query fails", async () => {
      pool.query.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app)
        .get("/api/tasks");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to fetch tasks"
      });
    });
  });

  // POST /api/tasks
  describe("POST /api/tasks", () => {
    test("should create a task", async () => {
      const mockTask = {
        id: 1,
        title: "New Task",
        description: "Task description",
        completed: false
      };

      pool.query.mockResolvedValue({
        rows: [mockTask]
      });

      const response = await request(app)
        .post("/api/tasks")
        .send({
          title: "New Task",
          description: "Task description"
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockTask);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test("should return 400 if title is missing", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({
          description: "No title"
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Title is required"
      });

      expect(pool.query).not.toHaveBeenCalled();
    });

    test("should return 400 if title is empty", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({
          title: "   "
        });

      expect(response.status).toBe(400);
      expect(pool.query).not.toHaveBeenCalled();
    });

    test("should return 500 if database query fails", async () => {
      pool.query.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app)
        .post("/api/tasks")
        .send({
          title: "New Task"
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to create task"
      });
    });
  });

  // PUT /api/tasks/:id
  describe("PUT /api/tasks/:id", () => {
    test("should update a task", async () => {
      const updatedTask = {
        id: 1,
        title: "Updated Task",
        description: "Updated description",
        completed: true
      };

      pool.query.mockResolvedValue({
        rows: [updatedTask]
      });

      const response = await request(app)
        .put("/api/tasks/1")
        .send({
          title: "Updated Task",
          description: "Updated description",
          completed: true
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedTask);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test("should return 404 if task does not exist", async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      const response = await request(app)
        .put("/api/tasks/999")
        .send({
          title: "Updated Task"
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Task not found"
      });
    });

    test("should return 500 if database query fails", async () => {
      pool.query.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app)
        .put("/api/tasks/1")
        .send({
          title: "Updated Task"
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to update task"
      });
    });
  });

  // DELETE /api/tasks/:id
  describe("DELETE /api/tasks/:id", () => {
    test("should delete a task", async () => {
      const deletedTask = {
        id: 1,
        title: "Deleted Task",
        description: "Task description",
        completed: false
      };

      pool.query.mockResolvedValue({
        rows: [deletedTask]
      });

      const response = await request(app)
        .delete("/api/tasks/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Task deleted successfully"
      });

      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test("should return 404 if task does not exist", async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      const response = await request(app)
        .delete("/api/tasks/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Task not found"
      });
    });

    test("should return 500 if database query fails", async () => {
      pool.query.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app)
        .delete("/api/tasks/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to delete task"
      });
    });
  });
});
