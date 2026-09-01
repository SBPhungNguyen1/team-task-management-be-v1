import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { RoleEnum } from 'src/common/enums/roles.enum';

export default class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(UserEntity);

    if (await repository.count()) return;

    const hashedPassword = await bcrypt.hash('123', 10);

    await repository.save({
      name: 'spadmin',
      email: 'spadmin@example.com',
      role: RoleEnum.SUPER_ADMIN,
      password: hashedPassword,
    });
  }
}
