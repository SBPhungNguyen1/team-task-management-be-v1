import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('organizations')
export class OrganizationEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  name!: string;
}
