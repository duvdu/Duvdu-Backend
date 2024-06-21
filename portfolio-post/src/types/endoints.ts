import { PaginationResponse, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Iproject } from '../models/project.model';


export interface CreateProjectHandler
extends RequestHandler<unknown , SuccessResponse<{data:Iproject}> , Pick<Iproject , 'address' | 'attachments' | 'category' | 'cover' | 'creatives' | 'description' | 'functions' | 'insurance' | 'location' | 'name' | 'projectScale' | 'searchKeyWords' | 'showOnHome' | 'tools' | 'subCategory' | 'tags' > & {subCategoryId:string , tagsId:string[]} , unknown>{}

export interface UpdateProjectHandler
extends RequestHandler<{projectId:string } , SuccessResponse<{data:Iproject}> , Pick<Iproject , 'address' | 'attachments' | 'cover' | 'description' | 'insurance' | 'location' | 'name' | 'projectScale' | 'searchKeyWords' | 'showOnHome' > , unknown>{}

export interface GetProjectHandler
extends RequestHandler<{projectId:string} , SuccessResponse<{data:Iproject}> , unknown , unknown>{}

export interface GetProjectsHandler
extends RequestHandler<unknown , PaginationResponse<{data:Iproject[]}> , unknown , unknown>{}

export interface DeleteProjectHandler
extends RequestHandler<{projectId:string} , SuccessResponse , unknown , unknown>{}