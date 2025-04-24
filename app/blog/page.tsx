// app/blog/page.tsx

const BlogPage: React.FC = () => {
  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-8 text-primary">Blog</h1>
      
      <p className="text-lg mb-8">Explore our latest articles on sustainable sourcing, eco-friendly materials, and more.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Placeholder for blog post previews */}
        <div className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-200">
          <h2 className="text-2xl font-semibold mb-4">Post Title 1</h2>
          <p className="text-gray-700 mb-4">A brief summary or snippet of the blog post goes here...</p>
          <button className="btn btn-outline btn-primary">Read More</button>
        </div>
        
        <div className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-200">
          <h2 className="text-2xl font-semibold mb-4">Post Title 2</h2>
          <p className="text-gray-700 mb-4">A brief summary or snippet of the blog post goes here...</p>
          <button className="btn btn-outline btn-primary">Read More</button>
        </div>
        
        <div className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-200">
          <h2 className="text-2xl font-semibold mb-4">Post Title 3</h2>
          <p className="text-gray-700 mb-4">A brief summary or snippet of the blog post goes here...</p>
          <button className="btn btn-outline btn-primary">Read More</button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
