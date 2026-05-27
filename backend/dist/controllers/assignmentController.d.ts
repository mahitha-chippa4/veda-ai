import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function createAssignment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getAssignments(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getAssignment(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteAssignment(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function regenerateAssignment(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getPaper(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=assignmentController.d.ts.map