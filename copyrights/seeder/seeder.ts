import { Categories, dbConnection, Users } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { CopyRights } from '../src/models/copyrights.model';

const egyptianGovernorates = [
  'Alexandria',
  'Aswan',
  'Asyut',
  'Beheira',
  'Beni Suef',
  'Cairo',
  'Dakahlia',
  'Damietta',
  'Faiyum',
  'Gharbia',
  'Giza',
  'Ismailia',
  'Kafr El Sheikh',
  'Luxor',
  'Matrouh',
  'Minya',
  'Monufia',
  'New Valley',
  'North Sinai',
  'Port Said',
  'Qalyubia',
  'Qena',
  'Red Sea',
  'Sharqia',
  'Sohag',
  'South Sinai',
  'Suez',
];

const getRandomfrom = (list: any): any =>
  egyptianGovernorates[Math.floor(Math.random() * list.length)];

(async () => {
  console.log('start seeder');
  await dbConnection('mongodb://127.0.0.1:8080/test');
  await CopyRights.deleteMany({});
  await Users.deleteMany({ username: { $regex: 'user_num', $options: 'i' } });
  await Categories.deleteMany({ username: { $regex: 'category_num', $options: 'i' } });

  // regular users
  const regularUsers = await Users.create(
    Array(100)
      .fill({})
      .map((el, i) => ({ username: `user_num_${i}` })),
  );
  // categories
  const categories = await Categories.create(
    Array(20)
      .fill({})
      .map((el, i) => ({ title: 'category_num' + i, cycle: 3 })),
  );
  // projects
  for (const user of regularUsers) {
    // const projects =
    await CopyRights.create(
      Array(1)
        .fill({})
        .map((el, i) => ({
          user: user.id,
          title: `dummy_project_${user.username}_num_${i}`,
          address: getRandomfrom(egyptianGovernorates),
          category: getRandomfrom(categories).id,
          price: Math.round(1 + Math.random() * 100000),
          showOnHome: Math.floor(Math.random() * 10) > 0,
          cycle: 3,
          isDeleted: Math.floor(Math.random() * 10) < 1,
        })),
    );
    // console.log(projects.length, 'created for user', user.username);
  }

  await mongoose.connection.close();
  console.log('done');
})();
