import { JobProgress, GeneratedPaperData } from '../types';
export declare function setJobProgress(assignmentId: string, progress: JobProgress): Promise<void>;
export declare function getJobProgress(assignmentId: string): Promise<JobProgress | null>;
export declare function setCachedPaper(assignmentId: string, paper: GeneratedPaperData): Promise<void>;
export declare function getCachedPaper(assignmentId: string): Promise<GeneratedPaperData | null>;
export declare function invalidatePaperCache(assignmentId: string): Promise<void>;
//# sourceMappingURL=cache.d.ts.map