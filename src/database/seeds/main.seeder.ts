import { DataSource } from 'typeorm';
import UserSeeder from './user.seeder';
import { Seeder } from 'typeorm-extension';

export default class MainSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    await new UserSeeder().run(dataSource);
  }
}
