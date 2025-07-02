import prisma from "../config/prisma";
import { isJobPost } from "./nlp.service";

export async function filterJobPosts(rawPosts: string[], userId: number): Promise<string[]> {
    const keywords = await prisma.keyword.findMany({
        where: { userId }
    });

    return rawPosts.filter(post => isJobPost(post, keywords));
}
