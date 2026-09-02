import { BaseEntity } from 'src/common/entities/base.entity';
import { ProjectEntity } from 'src/modules/projects/entities/project.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('tasks')
export class TaskEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'varchar' })
  description!: string;

  @Column({ type: 'varchar' })
  status!: string;

  @Column({ type: 'varchar' })
  priority!: string;

  @Column({ name: 'project_id', type: 'uuid' })
  project_id!: string;

  @ManyToOne(() => ProjectEntity, (project) => project.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project!: ProjectEntity;
}
