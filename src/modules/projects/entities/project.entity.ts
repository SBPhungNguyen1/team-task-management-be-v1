import { BaseEntity } from 'src/common/entities/base.entity';
import { OrganizationEntity } from 'src/modules/organizations/entities/organization.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

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
}
