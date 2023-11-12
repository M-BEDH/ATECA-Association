export class Sauce {
  _id!: string;
  name!: string;
  manufacturer!: string;
  description!: null | string;

  likes!: number;
  dislikes!: number;
  imageUrl!: string;

  usersLiked!: string[];
  usersDisliked!: string[];
  userId!: string;
}
