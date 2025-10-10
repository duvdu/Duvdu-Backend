import {
  BadRequestError,
  Categories,
  CYCLES,
  InviteStatus,
  NotFound,
  Setting,
  Users,
} from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

export const inviteCreatives = async (
  invitedUsers: {
    number: string;
    mainCategory: {
      category: Types.ObjectId;
      subCategories: { subCategory?: Types.ObjectId; tags?: Types.ObjectId[] };
      relatedCategory?: {
        category: Types.ObjectId;
        subCategories: { subCategory?: Types.ObjectId; tags?: Types.ObjectId[] };
      };
    };
  }[],
  lang: string,
) => {
  for (const user of invitedUsers) {
    const category = await Categories.findById(user.mainCategory.category);
    if (!category) throw new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' }, lang);

    if (category.cycle != CYCLES.portfolioPost) {
      throw new BadRequestError(
        { en: 'category is not project category', ar: 'الفئة غير مناسبة للمشروع' },
        lang,
      );
    }

    // Only validate subcategory if it's provided
    if (user.mainCategory.subCategories?.subCategory) {
      const subCategoryExists = category.subCategories?.some((subCategory: any) => {
        if (
          subCategory &&
          subCategory._id &&
          subCategory._id.toString() === user.mainCategory.subCategories.subCategory!.toString()
        ) {
          // check tags
          user.mainCategory.subCategories?.tags?.forEach((tag: any) => {
            if (
              subCategory.tags &&
              !subCategory.tags.some((subTag: any) => subTag._id.toString() === tag.tag.toString())
            ) {
              throw new BadRequestError(
                { en: 'tag is not in the sub category', ar: 'التصنيف غير موجود في الفئة الفرعية' },
                lang,
              );
            }
          });
          return true;
        }
        return false;
      });

      if (!subCategoryExists) {
        throw new BadRequestError(
          { en: 'sub category not found', ar: 'الفئة الفرعية غير موجودة' },
          lang,
        );
      }
    }

    // check related category
    if (user.mainCategory.relatedCategory) {
      const relatedCategory = await Categories.findById(user.mainCategory.relatedCategory.category);
      if (!relatedCategory)
        throw new NotFound(
          { en: 'related category not found', ar: 'الفئة المتعلقة غير موجودة' },
          lang,
        );

      const relatedSubCategoryExists = relatedCategory.subCategories?.some((subCategory: any) => {
        if (
          subCategory &&
          subCategory._id &&
          user.mainCategory.relatedCategory?.subCategories?.subCategory &&
          subCategory._id.toString() ===
            user.mainCategory.relatedCategory.subCategories.subCategory.toString()
        ) {
          // check tags
          user.mainCategory.relatedCategory?.subCategories.tags?.forEach((tag: any) => {
            if (
              subCategory.tags &&
              !subCategory.tags.some((subTag: any) => subTag._id.toString() === tag.tag.toString())
            ) {
              throw new BadRequestError(
                { en: 'tag is not in the sub category', ar: 'التصنيف غير موجود في الفئة الفرعية' },
                lang,
              );
            }
          });
          return true;
        }
        return false;
      });

      if (!relatedSubCategoryExists) {
        throw new BadRequestError(
          { en: 'related sub category not found', ar: 'الفئة الفرعية المتعلقة غير موجودة' },
          lang,
        );
      }
    }
  }

  const appSettings = await Setting.findOne();

  try {
    const createdUsers = await Users.create(
      invitedUsers.map((user) => ({
        phoneNumber: { number: user.number },
        haveInvitation: true,
        profileImage: appSettings?.default_profile,
        coverImage: appSettings?.default_cover,
      })),
    );

    // Update return structure to match IprojectCycle
    return createdUsers.map((el, index) => ({
      creative: el._id,
      inviteStatus: InviteStatus.pending,
      mainCategory: {
        category: invitedUsers[index].mainCategory.category,
        subCategories: invitedUsers[index].mainCategory.subCategories,
        relatedCategory: invitedUsers[index].mainCategory.relatedCategory
          ? {
              category: invitedUsers[index].mainCategory.relatedCategory?.category,
              subCategories: invitedUsers[index].mainCategory.relatedCategory?.subCategories,
            }
          : null,
      },
    }));
  } catch (error) {
    throw new BadRequestError({ en: 'creative already exists', ar: 'المبدع موجود بالفعل' }, lang);
  }
};

export const validateCreative = async (
  creatives: {
    creative: Types.ObjectId;
    inviteStatus: InviteStatus;
    mainCategory: {
      category: Types.ObjectId;
      subCategories: { subCategory?: Types.ObjectId; tags?: Types.ObjectId[] };
      relatedCategory?: {
        category: Types.ObjectId;
        subCategories: { subCategory?: Types.ObjectId; tags?: Types.ObjectId[] };
      };
    };
  }[],
  lang: string,
) => {
  const creativesCount = await Users.countDocuments({
    _id: { $in: creatives.map((creative) => creative.creative) },
  });
  if (creativesCount != creatives.length)
    throw new BadRequestError(
      { en: 'some creatives not found', ar: 'بعض المبدعين غير موجودين' },
      lang,
    );

  for (const creative of creatives) {
    const category = await Categories.findById(creative.mainCategory.category);
    if (!category) throw new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' }, lang);

    if (category.cycle != CYCLES.portfolioPost) {
      throw new BadRequestError(
        { en: 'category is not project category', ar: 'الفئة غير مناسبة للمشروع' },
        lang,
      );
    }

    // Only validate subcategory if it's provided
    if (creative.mainCategory.subCategories?.subCategory) {
      const subCategoryExists = category.subCategories?.some((subCategory: any) => {
        if (
          subCategory &&
          subCategory._id &&
          subCategory._id.toString() === creative.mainCategory.subCategories.subCategory!.toString()
        ) {
          // check tags
          creative.mainCategory.subCategories.tags?.forEach((tag: any) => {
            if (
              subCategory.tags &&
              !subCategory.tags.some((subTag: any) => subTag._id.toString() === tag.tag.toString())
            ) {
              throw new BadRequestError(
                { en: 'tag is not in the sub category', ar: 'التصنيف غير موجود في الفئة الفرعية' },
                lang,
              );
            }
          });
          return true;
        }
        return false;
      });

      if (!subCategoryExists) {
        throw new BadRequestError(
          { en: 'sub category not found', ar: 'الفئة الفرعية غير موجودة' },
          lang,
        );
      }
    }

    if (creative.mainCategory.relatedCategory) {
      const relatedCategory = await Categories.findById(
        creative.mainCategory.relatedCategory.category,
      );
      if (!relatedCategory)
        throw new NotFound(
          { en: 'related category not found', ar: 'الفئة المتعلقة غير موجودة' },
          lang,
        );

      const relatedSubCategoryExists = relatedCategory.subCategories?.some((subCategory: any) => {
        if (
          subCategory &&
          subCategory._id &&
          creative.mainCategory.relatedCategory?.subCategories?.subCategory &&
          subCategory._id.toString() ===
            creative.mainCategory.relatedCategory.subCategories.subCategory.toString()
        ) {
          // check tags
          creative.mainCategory.relatedCategory?.subCategories.tags?.forEach((tag: any) => {
            if (
              subCategory.tags &&
              !subCategory.tags.some((subTag: any) => subTag._id.toString() === tag.tag.toString())
            ) {
              throw new BadRequestError(
                { en: 'tag is not in the sub category', ar: 'التصنيف غير موجود في الفئة الفرعية' },
                lang,
              );
            }
          });
          return true;
        }
        return false;
      });

      if (!relatedSubCategoryExists) {
        throw new BadRequestError(
          { en: 'related sub category not found', ar: 'الفئة الفرعية المتعلقة غير موجودة' },
          lang,
        );
      }
    }
  }

  return true;
};
