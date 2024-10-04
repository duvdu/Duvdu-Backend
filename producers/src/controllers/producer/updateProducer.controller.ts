import 'express-async-errors';
import {
  BadRequestError,
  Categories,
  CYCLES,
  NotFound,
  Producer,
  ProducerPlatform,
} from '@duvdu-v1/duvdu';

import { UpdateProducerHandler } from '../../types/endpoints';

export const updateProducerHandler: UpdateProducerHandler = async (req, res, next) => {
  try {
    const producer = await Producer.findOne({ user: req.loggedUser.id });

    if (!producer)
      return next(new NotFound({ en: 'producer not found', ar: 'المُنتج غير موجود' }, req.lang));

    if (producer.user.toString() != req.loggedUser.id)
      return next(
        new BadRequestError(
          {
            en: 'user not owner fro this producer form',
            ar: 'المستخدم ليس مالكًا لهذا النموذج للمنتج',
          },
          req.lang,
        ),
      );

    if (req.body.platforms) {
      const platforms = await ProducerPlatform.countDocuments({
        _id: req.body.platforms.map((el) => el),
      });
      if (platforms != req.body.platforms.length)
        return next(
          new BadRequestError({ en: 'invalid platform', ar: 'منصة غير صالحة' }, req.lang),
        );
    }

    if (req.body.subcategory) {
      const category = await Categories.findById(req.body.category);
      if (!category) {
        throw new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' }, req.lang);
      }

      if (category.cycle !== CYCLES.producer) {
        throw new BadRequestError(
          { en: 'this category not related to this cycle', ar: 'هذه الفئة غير مرتبطة بهذه الدورة' },
          req.lang,
        );
      }

      const subcategories = req.body.subcategory;

      if (subcategories && subcategories.length > 0) {
        const validSubcategories = category.subCategories!.filter((sub: any) =>
          subcategories.some((inputSub) => sub._id.toString() === inputSub.subcategory),
        );

        if (validSubcategories.length !== subcategories.length) {
          throw new BadRequestError(
            { en: 'invalid subcategory', ar: 'فئة فرعية غير صالحة' },
            req.lang,
          );
        }

        const resultSubCategories = validSubcategories.map((validSub: any) => {
          const inputSub = subcategories.find(
            (input) => input.subcategory === validSub._id.toString(),
          );

          let validTags = [];
          if (inputSub?.tags && inputSub.tags.length > 0) {
            validTags = validSub.tags.filter((tag: any) =>
              inputSub.tags.includes(tag._id.toString()),
            );

            if (validTags.length !== inputSub.tags.length) {
              throw new BadRequestError(
                { en: 'invalid tags in subcategory', ar: 'علامات غير صالحة في الفئة الفرعية' },
                req.lang,
              );
            }
          }

          return {
            title: validSub.title,
            tags: validTags.map((tag: any) => ({
              ar: tag.ar,
              en: tag.en,
              _id: tag._id,
            })),
            _id: validSub._id,
          };
        });

        req.body.subCategories = resultSubCategories;
      }
    }

    const updatedProducer = await Producer.findOneAndUpdate({ user: req.loggedUser.id }, req.body, {
      new: true,
    });

    res.status(200).json({ message: 'success', data: updatedProducer! });
  } catch (error) {
    next(error);
  }
};
