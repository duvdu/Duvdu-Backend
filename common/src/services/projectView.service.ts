import { Document } from 'mongoose';

import { NotFound } from '../errors/notfound-error';
import { Project } from '../models/allProjects.model';
import { ProjectView } from '../models/projectViews.model';
import { Users } from '../models/User.model';
import { Iuser } from '../types/User';

type UserDocument = Document & Iuser;

export const incrementProjectsView = async (userId: string , ref:string, projectId: string, lang: string) => {
  try {
    const user = (await Users.findById(userId)) as UserDocument;
    const project = await Project.findOne({ 'project.type': projectId });
    if (!user) throw new NotFound({ en: 'user not found', ar: 'لم يتم العثور على المستخدم' }, lang);

    user.projectsView += 1;
    await user.save();

    if (!project)
      throw new NotFound({ en: 'project not found', ar: 'لم يتم العثور على المشروع' }, lang);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    await ProjectView.updateOne(
      { user: userId, project: projectId, date: today },
      { $inc: { count: 1 }, $setOnInsert: { ref: ref , date: today } },
      { upsert: true },
    );

  } catch (error) {
    console.error('Error incrementing projectsView:', error);
    throw error;
  }
};
