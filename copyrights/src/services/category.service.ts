import { BadRequestError, Categories, NotFound } from '@duvdu-v1/duvdu';


interface Itag {
    ar: string;
    en: string;
}

interface Ititle {
    ar:string,
    en:string
}

export async function filterTagsForCategory(categoryId: string, subcategoryId: string, tags: string[] , cycle:string): Promise<{ subCategoryTitle: Ititle; filteredTags: Itag[] }> {
  const category = await Categories.findOne({ _id: categoryId });
  if (!category) throw new NotFound('Category not found');
  if (category.cycle !== cycle) throw new BadRequestError('This category is not related to this cycle');
      
  const subcategoryFound = category.subCategories?.find((subCategory: any) => subCategory._id.toString() === subcategoryId);
  
  if (!subcategoryFound) throw new BadRequestError('Invalid subcategory');

  function filterTags(tags: Itag[], searchStrings: string[]): Itag[] {
    return tags.filter(tag => searchStrings.includes(tag.ar) || searchStrings.includes(tag.en));
  }

  const filteredTags = filterTags(subcategoryFound.tags, tags);
  if (filteredTags.length != tags.length) throw new BadRequestError('Invalid tags');

  return {  subCategoryTitle:subcategoryFound.title, filteredTags };
}
