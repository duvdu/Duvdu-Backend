const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(
    'mongodb+srv://duvdu:01022484942Metoo@cluster0.vyclpiw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  );
  const products = await mongoose.connection.db?.collection('copyrights').find({}).toArray();
  for (const product of products || []) {
    await mongoose.connection.db?.collection('copyrights').updateOne(
      { _id: product._id },
      {
        $set: {
          location: {
            type: 'Point',
            coordinates: [31.2357, 30.0444],
          },
        },
      }
    );
  }
  console.log('done');
  await mongoose.connection.close();
  process.exit(0);
})();
