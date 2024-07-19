import { BadRequestError, Bucket, globalUploadMiddleware, Setting } from '@duvdu-v1/duvdu';
import { Router } from 'express';

const router = Router();

router.post(
  '/',
  globalUploadMiddleware('setting' as any).single('cover'),
  async (req, res, next) => {
    const { title, subTitle } = req.body;
    if (!title || !subTitle) return next(new BadRequestError());

    if (!req.file) return next(new BadRequestError('cover not found'));
    await new Bucket().saveBucketFiles('setting', req.file);

    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    setting.splash.push({ title, subTitle, cover: `setting/${req.file.filename}` });
    await setting.save();
    res.status(201).json(setting.splash);
  },
);

router.get('/', async (req, res) => {
  const setting = await Setting.findOne().lean();
  if (!setting) {
    return res.status(404).json({ message: 'Settings not found' });
  }

  setting.splash.forEach((el) => {
    el.cover = process.env.BUCKET_URL + '/' + el.cover;
  });

  res.status(200).json(setting.splash);
});

// Delete an item from the splash list by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const setting = await Setting.findOne();
  if (!setting) {
    return res.status(404).json({ message: 'Settings not found' });
  }

  const splashIndex = setting.splash.findIndex((item: any) => item._id?.toString() === id);
  if (splashIndex === -1) {
    return res.status(404).json({ message: 'Splash item not found' });
  }

  setting.splash.splice(splashIndex, 1);
  await setting.save();

  await new Bucket().removeBucketFiles(setting.splash[splashIndex].cover);
  res.status(200).json(setting);
});

export const splashRoutes = router;
