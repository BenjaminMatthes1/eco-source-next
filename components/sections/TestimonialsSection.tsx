// components/TestimonialsSection.tsx
import Link from 'next/link';

const testimonials = [
  {
    content: (
      <>
        <p>"Join our community and start making a difference."</p>
        <Link
          href="/signup"
          className="btn bg-transparent text-white border border-white mt-4 hover:bg-secondary hover:text-black"
        >
          Join Now
        </Link>
      </>
    ),
    bgImage: 'images/Testimonials-1.png',
  },
  {
    content: (
      <>
        <h3 className="text-3xl font-bold mb-4">Our Blog</h3>
        <p>
          Stay updated with the latest news and insights on sustainability and eco-friendly practices.
        </p>
        <Link
          href="/blog"
          className="btn bg-transparent text-white border border-white mt-4 hover:bg-secondary hover:text-black"
        >
          Visit Blog
        </Link>
      </>
    ),
    bgImage: 'images/Testimonials-2.png',
  },
  {
    content: (
      <>
        <p>"Be part of the change towards a sustainable future."</p>
        <Link
          href="/signup"
          className="btn bg-transparent text-white border border-white mt-4 hover:bg-secondary hover:text-black"
        >
          Join Now
        </Link>
      </>
    ),
    bgImage: 'images/Testimonials-3.png',
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-12 bg-base-100 text-center mx-8">
      <div className="flex flex-row justify-center items-stretch gap-6 ">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="relative w-full md:w-1/3 h-[700px] bg-cover bg-center rounded-lg shadow-lg overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:z-10"
            style={{ backgroundImage: `url(${testimonial.bgImage})` }}
          >
            <div className="absolute inset-0 bg-green-800 bg-opacity-50 flex flex-col justify-center items-center p-6 text-white transition-all duration-300 group-hover:bg-opacity-75">
              {testimonial.content}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
