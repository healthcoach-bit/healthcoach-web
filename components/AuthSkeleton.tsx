export default function AuthSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 sm:p-8 animate-pulse">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>

        {/* Form fields */}
        <div className="space-y-5 sm:space-y-6">
          {/* Email field */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-11 bg-gray-200 rounded"></div>
          </div>

          {/* Password field */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-11 bg-gray-200 rounded"></div>
          </div>

          {/* Submit button */}
          <div className="h-11 bg-gray-300 rounded"></div>
        </div>

        {/* Footer link */}
        <div className="mt-6 text-center">
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
