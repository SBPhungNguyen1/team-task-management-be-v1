import { BaseEntity } from 'src/common/entities/base.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('user_tokens')
export class UserTokenEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar' })
  refresh_token_hash!: string;

  @Column({ type: 'timestamp with time zone' })
  expires_at!: Date;

  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  user_agent!: string;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ip_address!: string;

  @ManyToOne(() => UserEntity, (user) => user.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
