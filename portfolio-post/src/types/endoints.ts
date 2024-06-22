import { IprojectCycle, PaginationResponse, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';



export interface CreateProjectHandler
extends RequestHandler<unknown , SuccessResponse<{data:IprojectCycle}> , Pick<IprojectCycle , 'address' | 'attachments' | 'category' | 'cover' | 'creatives' | 'description' | 'functions' | 'insurance' | 'location' | 'name' | 'projectScale' | 'searchKeyWords' | 'showOnHome' | 'tools' | 'subCategory' | 'tags' > & {subCategoryId:string , tagsId:string[]} , unknown>{}

export interface UpdateProjectHandler
extends RequestHandler<{projectId:string } , SuccessResponse<{data:IprojectCycle}> , Pick<IprojectCycle , 'address' | 'attachments' | 'cover' | 'description' | 'insurance' | 'location' | 'name' | 'projectScale' | 'searchKeyWords' | 'showOnHome' > , unknown>{}

export interface GetProjectHandler
extends RequestHandler<{projectId:string} , SuccessResponse<{data:IprojectCycle}> , unknown , unknown>{}

export interface GetProjectsHandler
extends RequestHandler<unknown , PaginationResponse<{data:IprojectCycle[]}> , unknown , unknown>{}

export interface DeleteProjectHandler
extends RequestHandler<{projectId:string} , SuccessResponse , unknown , unknown>{}

export interface GetProjectsForCrmHandler
extends RequestHandler<unknown , PaginationResponse<{data:IprojectCycle[]}> , unknown , unknown>{}