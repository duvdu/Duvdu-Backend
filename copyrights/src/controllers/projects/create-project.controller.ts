import {
  SuccessResponse,
  CopyRights,
  IcopyRights,
  Project,
  MODELS,
  CYCLES,
  filterTagsForCategory,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const createProjectHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: IcopyRights }>,
  Pick<IcopyRights, 'category' | 'price' | 'duration' | 'address' | 'showOnHome' | 'location'> &
    Partial<Pick<IcopyRights, 'searchKeywords'>> & { tags: string[]; subCategory: string }
> = async (req, res, next) => {
  try {
    const { filteredTags, subCategoryTitle } = await filterTagsForCategory(
      req.body.category.toString(),
      req.body.subCategory,
      req.body.tags,
      CYCLES.copyRights,
      req.lang,
    );
    (req.body.subCategory as any) = { ...subCategoryTitle, _id: req.body.subCategory };
    (req.body.tags as any) = filteredTags;

    // location
    if (req.body.location)
      req.body.location = {
        type: 'Point',
        coordinates: [(req as any).body.location.lng, (req as any).body.location.lat],
      } as any;

    const project = await CopyRights.create({
      ...req.body,
      user: req.loggedUser.id,
    });

    await Project.create({
      _id: project._id,
      project: {
        type: project.id,
        ref: MODELS.copyrights,
      },
      user: req.loggedUser.id,
      ref: MODELS.copyrights,
    });
    res.status(201).json({ message: 'success', data: project });
  } catch (error) {
    next(error);
  }
};
