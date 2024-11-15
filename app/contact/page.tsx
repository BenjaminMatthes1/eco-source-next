// app/contact/page.tsx

const ContactPage: React.FC = () => {
  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-8 text-primary">Contact Us</h1>
      
      <p className="text-lg mb-6">Have questions or feedback? We'd love to hear from you. Please fill out the form below, and we'll get back to you as soon as possible.</p>

      <form className="max-w-xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Your Name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            rows={4}
            placeholder="Your message"
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary w-full">Send Message</button>
      </form>
    </div>
  );
};

export default ContactPage;
