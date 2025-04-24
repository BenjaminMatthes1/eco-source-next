// app/api/forum/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongooseClientPromise';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    const post = new Post({
      author: session.user.id,
      title,
      content,
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
    const filter = searchParams.get('filter') || '';
    const sort = searchParams.get('sort') || 'upvotes';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const threadId = searchParams.get('threadId'); // Get threadId from query parameter
    const authorId = searchParams.get('authorId'); // Get authorId from query parameter
  
    const query: any = {};
    if (threadId) {
      query.threadId = new mongoose.Types.ObjectId(threadId);
    }
  
    if (authorId) {
      query.author = new mongoose.Types.ObjectId(authorId); // Filter by author ID
    }
  
    if (filter) {
      query.title = { $regex: filter, $options: 'i' };
    }
  
    const sortOptions: any = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
  
    try {
      const posts = await Post.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name');
  
      const totalPosts = await Post.countDocuments(query);
  
      return NextResponse.json(
        { posts, totalPosts },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 });
    }
  }
  