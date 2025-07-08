{error && (
  <p className="text-sm text-red-500 mt-2">
    Error: {error instanceof Error ? error.message : 'Unknown error'}
  </p>
)}