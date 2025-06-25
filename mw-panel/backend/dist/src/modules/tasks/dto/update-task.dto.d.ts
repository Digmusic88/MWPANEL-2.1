import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from '../entities/task.entity';
declare const UpdateTaskDto_base: import("@nestjs/common").Type<Partial<CreateTaskDto>>;
export declare class UpdateTaskDto extends UpdateTaskDto_base {
    status?: TaskStatus;
    publishedAt?: Date;
    closedAt?: Date;
}
export {};
