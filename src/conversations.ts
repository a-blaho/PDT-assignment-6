import * as fs from "fs";
import { createdAt, prisma, toObjectId } from "./common";

export async function exportConversations() {
  console.time("Conversations took");
  console.log("Starting export of conversations");

  const file = "data/conversations.json";

  const batchSize = 100000;
  let offset = 0;

  console.log("Creating new file");
  // create new file
  fs.writeFileSync(file, "");
  // start array
  fs.appendFileSync(file, "[");

  while (true) {
    const conversations = await prisma.conversations.findMany({
      where: {
        created_at: createdAt,
      },
      include: {
        conversation_hashtags: {
          select: { hashtags: { select: { tag: true } } },
        },
        annotations: {
          select: { value: true, type: true, probability: true },
        },
        links: {
          select: { url: true, title: true, description: true },
        },
        referenced: {
          select: { type: true, parent_id: true },
          where: {
            parent: { created_at: createdAt },
          },
        },
        context_annotations: {
          select: { context_domain_id: true, context_entity_id: true },
        },
      },
      take: batchSize,
      skip: offset,
    });

    const stringified = JSON.stringify(
      conversations.map(
        ({ id, referenced, conversation_hashtags, ...conversation }) => ({
          _id: toObjectId(id),
          ...conversation,
          author_id: toObjectId(conversation.author_id),
          hashtags: conversation_hashtags.map((h) => h.hashtags.tag),
          context_annotations: conversation.context_annotations.map((ca) => ({
            ...ca,
            context_domain_id: toObjectId(ca.context_domain_id),
            context_entity_id: toObjectId(ca.context_entity_id),
          })),
          references: referenced.map((r) => ({
            ...r,
            parent_id: toObjectId(r.parent_id),
          })),
        })
      )
    );

    // remove array brackets
    fs.appendFileSync(file, stringified.slice(1, -1));

    if (conversations.length < batchSize) {
      break;
    }

    fs.appendFileSync(file, ", ");

    offset += conversations.length;

    console.timeLog("Conversations took");
    console.log(offset);
  }
  // end array
  fs.appendFileSync(file, "]");

  console.timeEnd("Conversations took");
}
