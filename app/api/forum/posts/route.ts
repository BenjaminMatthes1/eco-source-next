// app/api/forum/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import mongoose from 'mongoose';
import Comment  from '@/models/Comment';


export async function POST(request: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content, tags = [], photos = [] } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    const post = new Post({
      author: session.user.id,
      title,
      content,
      photos,
      tags,
    });

    await post.save();

    return NextResponse.json({ message: 'Post created', post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ message: 'Error creating post' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    await connectToDatabase();
  
    const { searchParams } = new URL(request.url);
    const q       = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'upvotes';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const threadId = searchParams.get('threadId'); // Get threadId from query parameter
    const authorId = searchParams.get('authorId'); // Get authorId from query parameter
    const tagsCSV  = searchParams.get('tags');            // "energy,policy"
    const postId   = searchParams.get('postId');          // single-post fetch
  
    const query: any = {};

    /* single-post mode overrides everything else */
    if (postId) {
      query._id = new mongoose.Types.ObjectId(postId);
    }
    if (threadId) {
      query.threadId = new mongoose.Types.ObjectId(threadId);
    }
  
    if (authorId) {
      query.author = new mongoose.Types.ObjectId(authorId); // Filter by author ID
    }
  
    if (q)        query.$text = { $search: q };
    if (tagsCSV)  query.tags  = { $all: tagsCSV.split(',') };
  
    const sortOptions: any = {};
    if (q) {
      /* when searching, first by Mongo textScore, then fallback sort param */
      sortOptions.score = { $meta: 'textScore' };
    }
  sortOptions[sort] = order === 'desc' ? -1 : 1;
    try {
      let mongo = Post.find(query, q ? { score: { $meta: 'textScore' } } : {})
                  .populate('author', 'name');

      if (!postId) {                    // list mode: add pagination
        mongo = mongo
          .sort(sortOptions)
          .skip((page - 1) * limit)
          .limit(limit);
      }

      const posts = await mongo.lean();

        // include comment counts
        const postIds = posts.map(p => p._id);
        const counts  = await Comment.aggregate([
          { $match: { post: { $in: postIds } } },
          { $group: { _id: '$post', comments: { $sum: 1 } } },
        ]);
        const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.comments]));

        posts.forEach((p: any) => (p.commentCount = countMap[p._id.toString()] || 0));
  
      const totalPosts = postId
      ? posts.length
      : await Post.countDocuments(query);
      return NextResponse.json(
        { posts, totalPosts },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 });
    }
  }
  