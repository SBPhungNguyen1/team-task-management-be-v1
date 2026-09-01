import { BaseEntity } from 'src/common/entities/base.entity';
import { ProjectEntity } from 'src/modules/projects/entities/project.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('organizations')
export class OrganizationEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @OneToMany(() => UserEntity, (user) => user.organization)
  users!: UserEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.organization)
  projects!: ProjectEntity[];
}
