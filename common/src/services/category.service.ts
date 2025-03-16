import { BadRequestError } from '../errors/bad-request-error';
import { NotFound } from '../errors/notfound-error';
import { Categories } from '../models/category.model';
import { CYCLES } from '../types/cycles';

interface Itag {
  ar: string;
  en: string;
}

interface Ititle {
  ar: string;
  en: string;
}

export async function filterTagsForCategory(
  categoryId: string,
  subcategoryId: string | undefined,
  tagIds: string[] | undefined,
  cycle: string,
  lang: string,
): Promise<{
  subCategoryTitle: Ititle | undefined;
  filteredTags: Itag[];
  media: string | undefined;
}> {
  const category = await Categories.findOne({ _id: categoryId, isRelated: false });
  if (!category) throw new NotFound({ en: 'Category not found', ar: 'الفئة غير موجودة' }, lang);
  if (category.cycle !== cycle)
    throw new BadRequestError(
      { en: 'This category is not related to this cycle', ar: 'هذه الفئة ليست مرتبطة بهذه الدورة' },
      lang,
    );

  if (cycle === CYCLES.portfolioPost) {
    if (!category.media)
      throw new BadRequestError(
        { en: 'category must be incluide media', ar: 'يجب أن تتضمن الفئة الوسائط' },
        lang,
      );
  }

  if (!subcategoryId)
    return {
      subCategoryTitle: undefined,
      filteredTags: [],
      media: category.media ? category.media : undefined,
    };

  const subcategoryFound = category.subCategories?.find(
    (subCategory: any) => subCategory._id.toString() === subcategoryId,
  );
  if (!subcategoryFound)
    throw new BadRequestError({ en: 'Invalid subcategory', ar: 'فئة فرعية غير صالحة' }, lang);

  if (!subcategoryFound.tags || !Array.isArray(subcategoryFound.tags)) {
    throw new BadRequestError(
      {
        en: 'Subcategory does not contain valid tags',
        ar: 'الفئة الفرعية لا تحتوي على علامات صالحة',
      },
      lang,
    );
  }

  let filteredTags;
  if (tagIds) {
    filteredTags = subcategoryFound.tags.filter((tag: any) => tagIds.includes(tag._id.toString()));
    if (filteredTags.length !== tagIds.length)
      throw new BadRequestError({ en: 'Invalid tags', ar: 'العلامات غير صالحة' }, lang);
  }

  return {
    subCategoryTitle: subcategoryFound.title,
    filteredTags: filteredTags || [],
    media: category.media ? category.media : undefined,
  };
}

export async function filterRelatedCategoryForCategory(
  categoryId: string,
  relatedCategories: Array<{
    category: string;
    subCategories?: Array<{
      subCategory: string;
      tags: Array<{ tag: string }>;
    }>;
  }>,
  lang: string,
): Promise<boolean> {
  // Validate main category exists and is not a related category
  const mainCategory = await Categories.findOne({ _id: categoryId, isRelated: false });
  if (!mainCategory) {
    throw new NotFound({ en: 'Category not found', ar: 'الفئة غير موجودة' }, lang);
  }

  // Get all related category IDs
  const relatedCategoryIds = relatedCategories.map((rc) => rc.category);

  // Fetch all related categories in one query
  const relatedCategoryDocs = await Categories.find({
    _id: { $in: relatedCategoryIds },
    isRelated: true,
  });

  if (relatedCategoryDocs.length !== relatedCategoryIds.length) {
    throw new BadRequestError(
      {
        en: 'One or more related categories not found',
        ar: 'واحد أو أكثر من الفئات المرتبطة غير موجودة',
      },
      lang,
    );
  }

  // Validate each related category's subcategories and tags
  for (const relatedCategory of relatedCategories) {
    const categoryDoc = relatedCategoryDocs.find(
      (doc) => doc._id.toString() === relatedCategory.category,
    );

    if (relatedCategory.subCategories) {
      for (const subCat of relatedCategory.subCategories) {
        // Find matching subcategory in the category document
        const foundSubCategory = categoryDoc?.subCategories?.find(
          (sc: any) => sc._id.toString() === subCat.subCategory,
        );

        if (!foundSubCategory) {
          throw new BadRequestError(
            { en: 'Invalid subcategory ID', ar: 'معرف الفئة الفرعية غير صالح' },
            lang,
          );
        }

        // Validate tags
        if (subCat.tags && subCat.tags.length > 0) {
          const validTagIds = foundSubCategory.tags.map((tag: any) => tag._id.toString());
          const providedTagIds = subCat.tags.map((t) => t.tag);

          const invalidTags = providedTagIds.filter((tagId) => !validTagIds.includes(tagId));
          if (invalidTags.length > 0) {
            throw new BadRequestError(
              { en: 'Invalid tags found', ar: 'تم العثور على علامات غير صالحة' },
              lang,
            );
          }
        }
      }
    }
  }

  return true;
}
