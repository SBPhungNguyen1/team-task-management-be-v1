import { BaseEntity } from 'src/common/entities/base.entity';
import { OrganizationEntity } from 'src/modules/organizations/entities/organization.entity';
import { TaskEntity } from 'src/modules/tasks/entities/task.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('projects')
export class ProjectEntity extends BaseEntity {
  @Column({ name: 'organization_id', type: 'uuid' })
  organization_id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  description!: string;

  @ManyToOne(() => OrganizationEntity, (org) => org.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @OneToMany(() => TaskEntity, (task) => task.project)
  tasks!: TaskEntity[];
}
