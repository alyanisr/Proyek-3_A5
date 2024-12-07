import express from "express";
const routerLinktree = express.Router();
import linktreeController from "../controllers/linktreeController.js";

routerLinktree.route("/").get(linktreeController.linktreeMenu);

routerLinktree.route("/create-room").post(linktreeController.createRoom);

routerLinktree.route("/room").get(linktreeController.linktreeRoom);

routerLinktree.route("/room-edit").get(linktreeController.linktreeRoomEdit);

routerLinktree.route("/get/:id").get(linktreeController.getLinktree);

routerLinktree.route("/save").patch(linktreeController.saveContent);

routerLinktree.route("/delete/:id").delete(linktreeController.deleteLinktree);

routerLinktree.route("/edit-url").patch(linktreeController.editLinktreeURL);

export default routerLinktree;
