import type { PrintJob } from "../types/print-job.js";

export interface AgentConfig {
  serverUrl: string;
  token: string;
}

export class Pedidos360Client {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(config: AgentConfig) {
    this.baseUrl = config.serverUrl.replace(/\/+$/, "");
    this.token = config.token;
  }

  private async request<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : `Error HTTP ${response.status}`
      );
    }

    return data as T;
  }

  async authenticate(): Promise<{
    success: boolean;
    agent: {
      id: string;
      restaurantId: string;
      name: string;
    };
  }> {
    return this.request("/api/restaurant/printing/auth");
  }

  async claimJobs(): Promise<PrintJob[]> {
    const response = await this.request<{
      success: boolean;
      jobs: PrintJob[];
    }>("/api/restaurant/printing/claim");

    return response.jobs ?? [];
  }

  async acknowledge(
    job: PrintJob,
    result: "submitted" | "printed" | "failed",
    error?: string
  ): Promise<void> {
    await this.request("/api/restaurant/printing/ack", {
      jobId: job.job_id,
      claimToken: job.claim_token,
      result,
      ...(error ? { error } : {}),
    });
  }
}