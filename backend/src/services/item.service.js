import { AppDataSource } from "../config/configDb.js";
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

export async function updateItem(id, data) {
  const itemRepository = AppDataSource.getRepository(Item);
  await itemRepository.update(id, data);
  return await itemRepository.findOneBy({ id });
}

export async function deleteItem(id) {
  const itemRepository = AppDataSource.getRepository(Item);
  const item = await itemRepository.findOneBy({ id });
  if (!item) return null;
  await itemRepository.delete(id);
  return item;
}
