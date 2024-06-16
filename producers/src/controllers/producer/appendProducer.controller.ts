import 'express-async-errors';
import { BadRequestError, Categories, CYCLES, NotFound, Producer } from '@duvdu-v1/duvdu';

import { AppendProducerHandler } from '../../types/endpoints';

export const appendProducerHandler: AppendProducerHandler = async (req, res, next) => {
  try {
    const category = await Categories.findById(req.body.category);
    if (!category) {
      throw new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' }, req.lang);
    }
  
    if (category.cycle !== CYCLES.producer) {
      throw new BadRequestError({ en: 'this category not related to this cycle', ar: 'هذه الفئة غير مرتبطة بهذه الدورة' }, req.lang);
    }
  
    const subcategories = req.body.subcategory;
  
    const validSubcategories = category.subCategories!.filter((sub: any) =>
      subcategories.some(
        (inputSub) => sub._id.toString() === inputSub.subcategory
      )
    );
  
    if (validSubcategories.length !== subcategories.length) {
      throw new BadRequestError({ en: 'invalid subcategory', ar: 'فئة فرعية غير صالحة' }, req.lang);
    }
  
    const resultSubCategories = validSubcategories.map((validSub: any) => {
      const inputSub = subcategories.find(
        (input) => input.subcategory === validSub._id.toString()
      );
  
      const validTags = validSub.tags.filter((tag: any) =>
          inputSub!.tags.includes(tag._id.toString())
      );
  
      if (validTags.length !== inputSub!.tags.length) {
        throw new BadRequestError(
          { en: 'invalid tags in subcategory', ar: 'علامات غير صالحة في الفئة الفرعية' },
          req.lang
        );
      }
  
      return {
        title: validSub.title,
        tags: validTags.map((tag: any) => ({
          ar: tag.ar,
          en: tag.en,
        })),
      };
    });
  
    req.body.subCategories = resultSubCategories;
  
    const producer = await Producer.create({
      ...req.body,
    //   user:req.loggedUser.id
    });
  
    res.status(201).json({message:'success' , data:producer});
  } catch (error) {
    next(error);
  }
};
