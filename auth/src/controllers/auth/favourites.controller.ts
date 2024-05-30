import { PaginationResponse, SuccessResponse, Users } from "@duvdu-v1/duvdu";
import { RequestHandler } from "express";

export const updateFavouriteList: RequestHandler<
  { projectId: string },
  SuccessResponse,
  unknown,
  { action?: "add" | "remove" }
> = async (req, res) => {
  const filter =
    req.query.action === "remove"
      ? { $pull: { favourites: req.params.projectId } }
      : { $addToSet: { favourites: req.params.projectId } };
  await Users.updateOne({ _id: req.loggedUser.id }, filter);

  res.status(200).json({ message: "success" });
};

export const getFavouriteProjects: RequestHandler<
  unknown,
  PaginationResponse<{ data: any }>
> = async (req, res, next) => {
  const projects = (await Users.findById(req.loggedUser.id)).favourites;
};
