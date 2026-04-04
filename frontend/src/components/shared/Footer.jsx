export default function SiteFooter() {
  return (
    <footer className="w-full p-12 border-t border-stone-900 text-stone-600 text-center">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} Stories Together. Built for community & collaboration &lt;3
      </p>
      <div className="mt-4 flex justify-center gap-6 text-xs font-medium">
        <a href="#" className="hover:text-stone-400 transition-colors">Links</a>
        <a href="#" className="hover:text-stone-400 transition-colors">Here</a>
        <a href="#" className="hover:text-stone-400 transition-colors">Eventually</a>
      </div>
    </footer>
  );
}