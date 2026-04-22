export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl mb-4">🍽️</p>
      <h1 className="text-xl font-bold text-[#212121] mb-2">Page Not Found</h1>
      <p className="text-sm text-[#757575] mb-6 max-w-xs">
        The page you're looking for doesn't exist.
      </p>
      <a href="/"
        className="text-sm font-medium text-[#FF5722] border border-[#FF5722] rounded-full px-5 py-2 hover:bg-[#FF5722] hover:text-white transition-colors">
        Go to home →
      </a>
    </div>
  )
}
