export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 px-6 text-center">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Jules Wellness. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}
