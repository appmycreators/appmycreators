/**
 * LoadingState - Componente de loading com skeleton
 * Responsabilidade única: Exibir estado de carregamento
 */

const LoadingState = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header Shimmer */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-48 h-6 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-64 h-4 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        
        {/* Cards Shimmer */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-card">
              <div className="space-y-3">
                <div className="w-3/4 h-5 bg-gray-200 rounded-lg animate-pulse" />
                <div className="w-1/2 h-4 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
