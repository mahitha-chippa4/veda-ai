import { getRedisClient } from './client';
import { JobProgress, GeneratedPaperData } from '../types';

const PAPER_CACHE_TTL = 86400; // 24 hours
const JOB_PROGRESS_TTL = 3600;  // 1 hour

export async function setJobProgress(assignmentId: string, progress: JobProgress): Promise<void> {
  const client = getRedisClient();
  await client.setex(`job:progress:${assignmentId}`, JOB_PROGRESS_TTL, JSON.stringify(progress));
}

export async function getJobProgress(assignmentId: string): Promise<JobProgress | null> {
  const client = getRedisClient();
  const data = await client.get(`job:progress:${assignmentId}`);
  return data ? JSON.parse(data) : null;
}

export async function setCachedPaper(assignmentId: string, paper: GeneratedPaperData): Promise<void> {
  const client = getRedisClient();
  await client.setex(`paper:${assignmentId}`, PAPER_CACHE_TTL, JSON.stringify(paper));
}

export async function getCachedPaper(assignmentId: string): Promise<GeneratedPaperData | null> {
  const client = getRedisClient();
  const data = await client.get(`paper:${assignmentId}`);
  return data ? JSON.parse(data) : null;
}

export async function invalidatePaperCache(assignmentId: string): Promise<void> {
  const client = getRedisClient();
  await client.del(`paper:${assignmentId}`);
  await client.del(`job:progress:${assignmentId}`);
}
