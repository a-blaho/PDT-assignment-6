import * as fs from "fs";
import { createdAt, prisma, toObjectId } from "./common";

export async function exportOthers() {
  console.time("Others took");

  const authorsFile = "data/authors.json";
  const contextDomainsFile = "data/contextDomains.json";
  const contextEntitiesFile = "data/contextEntities.json";

  await Promise.all([
    fs.writeFile(authorsFile, "", (err) => {
      if (err) throw err;
    }),
    fs.writeFile(contextDomainsFile, "", (err) => {
      if (err) throw err;
    }),
    fs.writeFile(contextEntitiesFile, "", (err) => {
      if (err) throw err;
    }),
  ]);

  const [authors, contextDomains, contextEntities] = await Promise.all([
    prisma.authors.findMany({
      where: { conversations: { some: { created_at: createdAt } } },
    }),
    prisma.context_domains.findMany({
      where: {
        context_annotations: {
          some: { conversations: { created_at: createdAt } },
        },
      },
    }),
    prisma.context_entities.findMany({
      where: {
        context_annotations: {
          some: { conversations: { created_at: createdAt } },
        },
      },
    }),
  ]);

  const stringifiedAuthors = JSON.stringify(
    authors.map(({ id, ...author }) => {
      return {
        _id: toObjectId(id),
        ...author,
      };
    })
  );

  const stringifiedContextDomains = JSON.stringify(
    contextDomains.map(({ id, ...contextDomain }) => {
      return {
        _id: toObjectId(id),
        ...contextDomain,
      };
    })
  );

  const stringifiedContextEntities = JSON.stringify(
    contextEntities.map(({ id, ...contextEntity }) => {
      return {
        _id: toObjectId(id),
        ...contextEntity,
      };
    })
  );

  await Promise.all([
    fs.appendFile(authorsFile, stringifiedAuthors, (err) => {
      if (err) throw err;
    }),
    fs.appendFile(contextDomainsFile, stringifiedContextDomains, (err) => {
      if (err) throw err;
    }),
    fs.appendFile(contextEntitiesFile, stringifiedContextEntities, (err) => {
      if (err) throw err;
    }),
  ]);

  console.timeEnd("Others took");
}
