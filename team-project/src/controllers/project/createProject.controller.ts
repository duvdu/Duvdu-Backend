import 'express-async-errors';

import { Bucket, FOLDERS, TeamProject } from '@duvdu-v1/duvdu';

import { CreateProjectHandler } from '../../types/project.endpoints';
// import { pendingQueue } from '../../utils/expirationQueue';

export const createProjectHandler: CreateProjectHandler = async (req, res) => {
  const files = req.files as { [fieldName: string]: Express.Multer.File[] };
  const s3 = new Bucket();

  // Initialize upload promises array
  const uploadPromises: Promise<void>[] = [];

  // Handle cover upload if exists
  if (files['cover']?.[0]) {
    uploadPromises.push(
      s3.saveBucketFiles(FOLDERS.team_project, files['cover'][0]).then(() => {
        req.body.cover = `${FOLDERS.team_project}/${files['cover'][0].filename}`;
      }),
    );
  }

  // Wait for all validations and uploads to complete
  await Promise.all([...uploadPromises]);

  // Create team project
  const team = await TeamProject.create({
    ...req.body,
    user: req.loggedUser?.id,
  });

  res.status(201).json({ message: 'success', data: team });
};
