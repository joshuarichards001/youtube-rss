import type { Response } from "express";

class ProgressTracker {
  private connections: Map<string, Set<Response>> = new Map();

  addConnection(userId: string, res: Response) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)?.add(res);

    console.log(
      `[SSE] Added connection for user ${userId}. Total connections: ${this.connections.get(userId)?.size}`,
    );

    // Clean up on close
    res.on("close", () => {
      this.removeConnection(userId, res);
    });
  }

  removeConnection(userId: string, res: Response) {
    const userConns = this.connections.get(userId);
    if (userConns) {
      userConns.delete(res);
      if (userConns.size === 0) {
        this.connections.delete(userId);
      }
    }
    console.log(`[SSE] Removed connection for user ${userId}`);
  }

  sendProgress(
    userId: string,
    data: {
      status: "starting" | "progress" | "completed" | "error";
      processed?: number;
      total?: number;
      message?: string;
    },
  ) {
    const userConns = this.connections.get(userId);
    if (!userConns) return;

    const payload = `data: ${JSON.stringify(data)}\n\n`;

    userConns.forEach((res) => {
      res.write(payload);
    });
  }
}

export const progressTracker = new ProgressTracker();
