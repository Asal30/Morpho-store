import express from "express";

import { createInventory, deleteInventory, getInventory, getInventoryRecord, getItemInventory, updateInventory } from "../controllers/inventoryController.js";
import { requireAdmin, requireAuth } from "../middleware/authentication.js";

const inventoryRouter = express.Router()

inventoryRouter.use(requireAuth, requireAdmin)
inventoryRouter.get("/", getInventory)
inventoryRouter.get("/item/:itemId", getItemInventory)
inventoryRouter.get("/:id", getInventoryRecord)
inventoryRouter.post("/", createInventory)
inventoryRouter.patch("/:id", updateInventory)
inventoryRouter.delete("/:id", deleteInventory)

export default inventoryRouter;
