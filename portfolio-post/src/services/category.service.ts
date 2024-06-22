import { BadRequestError, Categories, CYCLES, NotFound } from '@duvdu-v1/duvdu';

interface Itag {
    ar: string;
    en: string;
}

interface Ititle {
    ar: string;
    en: string;
}

export async function filterTagsForCategory(categoryId: string, subcategoryId: string, tagIds: string[], cycle: string , lang:string): Promise<{ subCategoryTitle: Ititle; filteredTags: Itag[] , media:string | undefined }> {
  const category = await Categories.findOne({ _id: categoryId });
  if (!category) throw new NotFound({en:'Category not found' , ar:'الفئة غير موجودة'} , lang);
  if (category.cycle !== cycle) throw new BadRequestError({en:'This category is not related to this cycle' , ar:'هذه الفئة ليست مرتبطة بهذه الدورة'} , lang);

  if (cycle === CYCLES.portfolioPost){
    if (!category.media) 
      throw new BadRequestError({en:'category must be incluide media' , ar:'يجب أن تتضمن الفئة الوسائط'} , lang);
  } 

  const subcategoryFound = category.subCategories?.find((subCategory: any) => subCategory._id.toString() === subcategoryId);
  if (!subcategoryFound) throw new BadRequestError({en:'Invalid subcategory' , ar:'فئة فرعية غير صالحة'} , lang);

  if (!subcategoryFound.tags || !Array.isArray(subcategoryFound.tags)) {
    throw new BadRequestError({en:'Subcategory does not contain valid tags' , ar:'الفئة الفرعية لا تحتوي على علامات صالحة'} , lang);
  }

  const filteredTags = subcategoryFound.tags.filter((tag: any) => tagIds.includes(tag._id.toString()));
  if (filteredTags.length !== tagIds.length) throw new BadRequestError({en:'Invalid tags' , ar:'العلامات غير صالحة'} , lang);
  


  return { subCategoryTitle: subcategoryFound.title, filteredTags, media:category.media?category.media:undefined };
}
