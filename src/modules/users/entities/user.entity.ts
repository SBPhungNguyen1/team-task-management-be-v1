import { BaseEntity } from 'src/common/entities/base.entity';
import { UserTokenEntity } from 'src/modules/auth/entities/auth.entity';
import { OrganizationEntity } from 'src/modules/organizations/entities/organization.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', select: false })
  password!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  role!: string;

  @OneToMany(() => UserTokenEntity, (token) => token.user)
  tokens!: UserTokenEntity[];

  @ManyToOne(() => OrganizationEntity, (org) => org.users, {
    nullable: true,
  })
  organization!: OrganizationEntity | null;
}
