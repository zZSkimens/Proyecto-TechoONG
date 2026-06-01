import { AppDataSource } from "../config/configDB.js";
import { Item } from "../entities/item.entity.js";

export async function createItem(data) {
  const itemRepository = AppDataSource.getRepository(Item);
  const newItem = itemRepository.create(data);
  return await itemRepository.save(newItem);
}

export async function getItems() {
  const itemRepository = AppDataSource.getRepository(Item);
  return await itemRepository.find();
}

export async function getItemById(id) {
  const itemRepository = AppDataSource.getRepository(Item);
  return await itemRepository.findOneBy({ id });
}
