import 'express-async-errors';
import {
  BadRequestError,
  Categories,
  CYCLES,
  NotFound,
  Producer,
  ProducerPlatform,
} from '@duvdu-v1/duvdu';

import { AppendProducerHandler } from '../../types/endpoints';

export const appendProducerHandler: AppendProducerHandler = async (req, res, next) => {
  const producer = await Producer.findOne({ user: req.loggedUser.id });
  if (producer)
    return next(
      new BadRequestError({ en: 'you are already producer', ar: 'أنت بالفعل منتج.' }, req.lang),
    );

  try {
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

    if (req.body.platforms) {
      const platforms = await ProducerPlatform.countDocuments({
        _id: req.body.platforms.map((el) => el),
      });
      if (platforms != req.body.platforms.length)
        return next(
          new BadRequestError({ en: 'invalid platform', ar: 'منصة غير صالحة' }, req.lang),
        );
    }

    const subcategories = req.body.subcategory;

    // Check if subcategories are provided
    if (subcategories && subcategories.length > 0) {
      const validSubcategories = category.subCategories!.filter((sub: any) =>
        subcategories.some((inputSub) => sub._id.toString() === inputSub.subcategory),
      );

      // Check if all provided subcategories are valid
      if (validSubcategories.length !== subcategories.length) {
        throw new BadRequestError(
          { en: 'invalid subcategory', ar: 'فئة فرعية غير صالحة' },
          req.lang,
        );
      }

      // Process each valid subcategory
      const resultSubCategories = validSubcategories.map((validSub: any) => {
        const inputSub = subcategories.find(
          (input) => input.subcategory === validSub._id.toString(),
        );

        // If tags are provided, validate them
        let validTags = [];
        if (inputSub?.tags && inputSub.tags.length > 0) {
          validTags = validSub.tags.filter((tag: any) =>
            inputSub.tags.includes(tag._id.toString()),
          );

          // Check if all provided tags are valid
          if (validTags.length !== inputSub.tags.length) {
            throw new BadRequestError(
              { en: 'invalid tags in subcategory', ar: 'علامات غير صالحة في الفئة الفرعية' },
              req.lang,
            );
          }
        }

        // Return subcategory with optional tags
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
    } else {
      req.body.subCategories = [];
    }

    const producer = await Producer.create({
      ...req.body,
      user: req.loggedUser.id,
    });

    res.status(201).json({ message: 'success', data: producer });
  } catch (error) {
    next(error);
  }
};
