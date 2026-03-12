import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-900">
                  Une erreur est survenue
                </h1>
                <p className="text-red-700">
                  L'application a rencontre un probleme
                </p>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <h2 className="font-bold text-red-900 mb-2">Erreur:</h2>
              <pre className="text-sm text-red-800 whitespace-pre-wrap break-words">
                {this.state.error?.toString()}
              </pre>
            </div>

            {this.state.errorInfo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h2 className="font-bold text-gray-900 mb-2">Stack trace:</h2>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
