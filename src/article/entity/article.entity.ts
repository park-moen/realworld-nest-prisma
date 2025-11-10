import { Tag } from '@app/tag/entity/tag.entity';
import { User } from '@prisma/client';

export class Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;

  tags?: Tag[];
  // ! Entity는 Domain Layer로 절대 Infrastructure Layer에 의존하면 안됨
  // ! 지금은 초기 구현 & Article 관련 로직만을 리팩토링하고 있어서
  // ! Tag Domain, User Domain의 로직을 수정하지 않는 방안으로 Prisma Client가 제공하는 타입 임시로 사용
  auth?: User;
}
