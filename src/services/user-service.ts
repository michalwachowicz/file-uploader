import prisma from "../prisma";
import { User } from "@prisma/client";
import { UserWithFoldersAndFiles } from "../types/user";

type CreateUserDto = Omit<User, "id" | "createdAt" | "updatedAt">;
type UpdateUserDto = Partial<CreateUserDto>;

class UserService {
  async getUserById(id: string): Promise<UserWithFoldersAndFiles | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        folders: { where: { parentId: null } },
        files: { where: { folderId: null } },
      },
    });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { username } });
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return await prisma.user.create({ data });
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return await prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string): Promise<User> {
    return await prisma.user.delete({ where: { id } });
  }
}

export default new UserService();
