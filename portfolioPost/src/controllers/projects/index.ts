import { RequestHandler } from 'express';
import { Projects } from '../../models/project';

export const createProjectHandler: RequestHandler = async (req, res, next) => {
  //TODO: handle upload files
  const category = await Categories;
  const project = await Projects.create({ ...req.body, user: req.loggedUser.id });
};
